var config = require('./../../config.js');
var http = require('http');
var twitter = require('twitter');
var io = require('socket.io');
var _ = require('underscore');
var _s = require('underscore.string');
var path = require('path');
var util = require('util');
// MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/resa_tweets');
//DBpedia Spotlight
var spotlight = require('dbpedia-spotlight');
var Extensions = require('../core/extensions.js');

function Resa(){

    this.params = {};
    this.guarded = {};

     this.watchList = {
        search_for: [],
        tweets_no: 0,
        total: 0,
        recent_tweets: [],
        symbols: {}
    };

    this.flags = {
        stop_streaming : 0,
        pause_streaming : 0,
        send_data : 0,
        valid_resource : false
    };

    //Instantiate the twitter component
    //You will need to get your own key. Don't worry, it's free. But I cannot provide you one
    //since it will instantiate a connection on my behalf and will drop all other streaming connections.
    //Check out: https://dev.twitter.com/1
    this.twitter = new twitter({
        consumer_key: config.get['twitter_consumer_key'],
        consumer_secret: config.get['twitter_consumer_secret'],
        access_token_key: config.get['twitter_access_token_key'],
        access_token_secret: config.get['twitter_access_token_secret']
    });

    this.initParams = function () {
        this.params = {
            name : 'resa',
            visualizations : ['bubblecloud']
        };
    };

    this.setGuarded = function () {
        this.guarded = ['visualizations'];
    };

    this.init = function (){
        this.initParams();
        this.setGuarded();
    };

    this.output = function (){
        return {
            watchList : this.watchList,
            params: this.params
        };
    };

    this.isValidTweet = function (tweet) {
        return tweet.text !== undefined;
    };

    this.stop = function () {
        this.flags.stop_streaming = 1;
    };

    this.pause = function () {
        this.flags.pause_streaming = 1;
    };

    this.resetFlags = function () {
        this.flags.stop_streaming = 0;
        this.flags.pause_streaming = 0;
        this.flags.send_data = 0;
        this.flags.valid_resource = false;
    };

    this.start = function (watchSymbols, sockets) {

        if (!watchSymbols.length) {
            return 0;
        }

        _this = this;

        _this.resetFlags();

        _this.watchList.search_for = watchSymbols;

        _this.twitter.stream('filter', {track: watchSymbols}, function (stream) {

            stream.on('data', function (tweet) {
                if (_this.flags.stop_streaming) {
                    _this.stopStreaming(stream, sockets);
                }
                if (_this.flags.pause_streaming) {
                    console.log('pause streaming...');
                    stream.destroy();
                    sockets.sockets.emit('pause', {});
                }

                _this.flags.send_data = 1;

                //Make sure it was a valid tweet
                if (_this.isValidTweet(tweet)) {
                    tweet.text = _s.titleize(tweet.text);
                    spotlight.annotate(tweet.text, function (output) {
                        if (output.response.Resources !== undefined) {

                            _.each(output.response.Resources, function (resource) {
                                //do not count search keywords
                                if (!_.contains(watchSymbols, resource['@surfaceForm'])) {

                                    _this.updateWatchListSymbol(resource, tweet);

                                    tweet.text = _this.annotateResource(tweet, resource);
                                }
                            });

                            _this.updateWatchListTweet(tweet);
                        }
                    })
                }
            });
            //add a threshold to stop service if we got more than 400 tweets
            if (_this.watchList.tweets_no > 400) {
                _this.stopStreaming(stream, sockets);
            }

            _this.emmitData(sockets);
            //acts as a buffer to slow down emiting results

        });
        /*
         //filter out results for scalability
         setInterval(function(){
         var removed_ones=removeWeakSymbols(watchList);
         if(Object.keys(removed_ones).length){
         sockets.sockets.emit('filter', removed_ones);
         }
         },3000)
         */
    };

    this.emmitData = function (sockets) {
        var _this = this;
        setInterval(function () {
            if (_this.flags.send_data) {
                sockets.sockets.emit('data', _this.output());
                _this.watchList.recent_tweets = [];
                _this.flags.send_data = 0;
            }
        }, 1500);
    };

    this.updateWatchListTweet = function (tweet) {
        this.watchList.tweets_no++;
        this.watchList.recent_tweets.push({text: tweet.text, date: tweet.created_at});
        //watchList.current_tweet.text=tweet.text;
        //watchList.current_tweet.date=tweet.created_at;
    };

    this.emptyWatchList = function () {
        this.watchList.tweets_no = 0;
        this.watchList.total = 0;
        this.watchList.recent_tweets = [];
        this.watchList.symbols = {}
    };

    this.stopStreaming = function (stream, sockets) {
        //Reset collection
        db.get('tweetscollection').drop();
        console.log('stop streaming...');
        this.emptyWatchList();
        stream.destroy();
        sockets.sockets.emit('data', this.watchList);
        sockets.sockets.emit('stop', {});
    };

    this.addToDB = function (tweet, output) {
        db.get('tweetscollection').insert({
            "tweet_id": tweet.id,
            "user_name": tweet.user.screen_name,
            "created_at": tweet.created_at,
            "place": tweet.place,
            "processed": output
        });
    };

    this.updateWatchListSymbol = function (resource, tweet) {
        if (this.watchList.symbols[resource['@surfaceForm']] == undefined) {
            this.watchList.symbols[resource['@surfaceForm']] = {
                count: 1,
                type: this.getEntityType(resource['@types']),
                uri: resource['@URI']
            };
        } else {
            this.watchList.symbols[resource['@surfaceForm']].count++;
            //Increment total
            this.watchList.total++;
            //limit for demo
            if (Object.keys(this.watchList.symbols).length > 400) {
                this.pause_streaming = 1;
            }
        }
    };

    this.annotateResource = function (tweet, resource) {
        return tweet.text.replace(resource['@surfaceForm'], '&nbsp;<span resource="' + resource['@URI'] + '" class="r_entity r_' +
               this.getEntityType(resource['@types']).toLowerCase() + '" typeOf="' + resource['@types'] + '">' + resource['@surfaceForm'] +
               '</span>&nbsp;');
    };

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

    Extensions.call(this);
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