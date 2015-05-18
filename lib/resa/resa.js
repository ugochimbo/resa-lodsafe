var http = require('http');
var io = require('socket.io');
var _ = require('underscore');
var _s = require('underscore.string');
var path = require('path');
var util = require('util');
// MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/resa_tweets');
var Extensions = require('../core/extensions.js');

/**
 *
 * @constructor
 */
function Resa(){

    Extensions.call(this);

    var _this = this;

    /**
     *
     */
    this.initParams = function () {
        /**
         *
         * @type {{name: string, visualizations: {name: string, title: string}[]}}
         */
        this.params = {
            name : 'resa',
            visualizations : [
                {'name': 'bubblecloud', 'title': 'Bubble Cloud'}
            ]
        };
    };

    /**
     *
     */
    this.setGuarded = function () {
        /**
         *
         * @type {string[]}
         */
        this.guarded = ['visualizations'];
    };

    /**
     *
     * @returns {{watchList: *, params: *}}
     */
    this.output = function (){
        return {
            watchList : this.watchList,
            params: this.params
        };
    };

    /**
     *
     * @param tweet
     * @returns {boolean}
     */
    this.isValidTweet = function (tweet) {
        return tweet.text !== undefined;
    };

    /**
     *
     */
    this.stop = function () {
        this.flags.stop_streaming = 1;
    };

    /**
     *
     */
    this.pause = function () {
        this.flags.pause_streaming = 1;
    };

    this.resetFlags = function () {
        this.flags.stop_streaming = 0;
        this.flags.pause_streaming = 0;
        this.flags.send_data = 0;
        this.flags.valid_resource = false;
    };

    /**
     *
     * @param tweet
     * @param output
     */
    this.annotateCallback = function (tweet, output) {
        var resources = output.response.Resources;
        if (resources !== undefined) {
            _.each(resources, function (resource) {
                //do not count search keywords
                if (!_.contains(_this.watchList.search_for, resource['@surfaceForm'])) {

                    _this.updateWatchListSymbol(resource, tweet);

                    _this.annotateTweetTextWithResource(resource, tweet);
                }
            });
            _this.updateWatchListTweet(tweet);
        }
    };

    /**
     *
     * @param tweet
     */
    this.annotate = function(tweet) {
        _this.annotator.SPOTLIGHT.annotate(tweet.text, function (output) {
            _this.annotateCallback(tweet, output);
        });
    };

    /**
     *
     * @param watchSymbols
     * @param sockets
     * @returns {number}
     */
    this.start = function (watchSymbols, sockets) {

        if (!watchSymbols.length) {
            return 0;
        }

        _this.resetFlags();

        _this.watchList.search_for = watchSymbols;

        _this.twitter.stream('filter', {track: watchSymbols}, function (stream) {

            stream.on('data', function (tweet) {

                if (!_this.isValidTweet(tweet))
                    return;

                if (_this.flags.stop_streaming) {
                    _this.stopStreaming(stream, sockets);
                }

                if (_this.flags.pause_streaming) {
                    _this.pauseStreaming(stream, sockets);
                }

                _this.flags.send_data = 1;

               // tweet.text = _s.titleize(tweet.text);

                _this.annotate(tweet);

            }).on('error', function (error) {
                console.log(error);
            });

            if (_this.watchList.tweets_no > _this.flags.DEMO_LIMIT) {
                _this.stopStreaming(stream, sockets);
            }

            _this.emmitData(sockets);

        });
    };

    /**
     *
     * @param sockets
     */
    this.emmitData = function (sockets) {
        setInterval(function () {
            if (_this.flags.send_data) {
                sockets.sockets.emit('data', _this.output());
                _this.postEmit();
            }
        }, 1500);
    };

    this.postEmit = function () {
        _this.watchList.recent_tweets = [];
        _this.flags.send_data = 0;
        _this.customPostEmit();
    };

    /**
     *
     * @param tweet
     */
    this.updateWatchListTweet = function (tweet) {
        this.watchList.tweets_no++;
        this.watchList.recent_tweets.push({text: tweet.text, date: tweet.created_at});
    };

    /**
     *
     */
    this.emptyWatchList = function () {
        this.watchList.tweets_no = 0;
        this.watchList.total = 0;
        this.watchList.recent_tweets = [];
        this.watchList.symbols = {}
    };

    /**
     *
     * @param stream
     * @param sockets
     */
    this.stopStreaming = function (stream, sockets) {
        //Reset collection
      //  db.get('tweetscollection').drop();
        console.log('stop streaming...');
        this.emptyWatchList();
        stream.destroy();
        sockets.sockets.emit('data', this.watchList);
        sockets.sockets.emit('stop', {});
    };

    /**
     *
     * @param stream
     * @param sockets
     */
    this.pauseStreaming = function(stream, sockets) {
        console.log('pause streaming...');
        stream.destroy();
        sockets.sockets.emit('pause', {});
    };

    /**
     *
     * @param tweet
     * @param output
     */
    this.addToDB = function (tweet, output) {
        db.get('tweetscollection').insert({
            "tweet_id": tweet.id,
            "user_name": tweet.user.screen_name,
            "created_at": tweet.created_at,
            "place": tweet.place,
            "processed": output
        });
    };

    /**
     *
     */
    this.limitForDemo = function() {
        if (Object.keys(this.watchList.symbols).length > this.flags.DEMO_LIMIT) {
            this.pause_streaming = 1;
        }
    };


    /**
     *
     */
    this.updateWatchListTotal = function () {
        this.watchList.total++;
    };

    /**
     *
     * @param resource
     * @param tweet
     */
    this.updateWatchListSymbol = function (resource, tweet) {
        if (this.watchList.symbols[resource['@surfaceForm']] == undefined) {
            this.watchList.symbols[resource['@surfaceForm']] = {
                count: 1,
                type: this.getEntityType(resource['@types']),
                uri: resource['@URI']
            };
        } else {
            this.updateWatchListTotal();
            this.limitForDemo();
        }
    };

    this.createAnnotatedResource = function (resource) {
        return '&nbsp;<span resource="' + resource['@URI'] + '" class="r_entity r_' +
            this.getEntityType(resource['@types']).toLowerCase() + '" typeOf="' + resource['@types'] + '">' + resource['@surfaceForm'] +
            '</span>&nbsp;';
    };
    /**
     *
     * @param resource
     * @param tweet
     * @returns {*|string}
     */
    this.annotateTweetTextWithResource = function (resource, tweet) {
        tweet.text = tweet.text.replace(resource['@surfaceForm'], this.createAnnotatedResource(resource));

        return tweet;
    };

    /**
     *
     * @param types_str
     * @returns {string}
     */
    this.getEntityType = function (types_str) {
        if (types_str == '') {
            return 'Misc';
        }
        var tmp, out = '', types_arr = types_str.split(',');
        _.each(types_arr, function (v) {
            tmp = v.split(':');
            if (tmp[0] == 'Schema') {
                out = tmp[1];
            }
        });
        if (out) {
            return out;
        } else {
            return 'Misc';
        }
    };

//TODO:delete low level nodes when we get a huge amount of links
    /**
     *
     * @param output
     * @returns {{}}
     */
    this.removeWeakSymbols = function (output) {
        var filtered_list = {};
        var removed_ones = {};
        // calculate the count of symbols
        var symbols_no = Object.keys(output.symbols).length;
        if (symbols_no > 20) {
            _.each(output.symbols, function (v, i) {
                if (v.count > 1) {
                    filtered_list[i] = v;
                } else {
                    removed_ones[i] = v;
                }
            });
            output.symbols = filtered_list;
        }
        return removed_ones;
    };

}
util.inherits(Resa, Extensions);

module.exports = Resa;

//Reset everything on a new day!
//We don't want to keep data around from the previous day so reset everything.
/*
 new cronJob('0 0 0 * * *', function(){
 //Reset collection
 //db.get('tweetscollection').drop();

 //Reset the total
 watchList.total = 0;

 //Clear out everything in the map
 _.each(watchSymbols, function(v) { watchList.symbols[v] = {}; });

 //Send the update to the clients
 sockets.sockets.emit('data', watchList);
 }, null, true);
 */