var config = require('./config.js');
var http = require('http');
var twitter = require('twitter');
var io = require('socket.io');
var _ = require('underscore');
var path = require('path');
//var util = require('util');
// MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/resa_tweets');
//DBpedia Spotlight
var spotlight = require('./spotlight.js');

function Annotator(){}

_this = Annotator.prototype;

_this.watchList = {
    search_for: [],
    tweets_no: 0,
    total: 0,
    recent_tweets: [],
    symbols: {}
};

//Instantiate the twitter component
//You will need to get your own key. Don't worry, it's free. But I cannot provide you one
//since it will instantiate a connection on my behalf and will drop all other streaming connections.
//Check out: https://dev.twitter.com/1
_this.twitter = new twitter({
    consumer_key: config.get['twitter_consumer_key'],
    consumer_secret: config.get['twitter_consumer_secret'],
    access_token_key: config.get['twitter_access_token_key'],
    access_token_secret: config.get['twitter_access_token_secret']
});

_this.stop_streaming = 0;

_this.stop = function () {
    _this.stop_streaming = 1;
};

_this.pause_streaming = 0;

_this.pause = function () {
    _this.pause_streaming = 1;
};

_this.send_data = 0;

_this.start = function (watchSymbols, sockets) {
    _this.stop_streaming = 0;
    _this.pause_streaming = 0;
    _this.send_data = 0;

    if (!watchSymbols.length) {
        return 0;
    }

    this.watchList.search_for = watchSymbols;

    this.twitter.stream('filter', {track: watchSymbols}, function (stream) {
        stream.on('data', function (tweet) {
            if (_this.stop_streaming) {
                _this.stopStreaming(stream, sockets);
            }
            if (_this.pause_streaming) {
                console.log('pause streaming...');
                stream.destroy();
                sockets.sockets.emit('pause', {});
            }

            _this.send_data = 1;

            //Make sure it was a valid tweet with place or geo-location enabled (Place used below)
            if (tweet.text !== undefined) {
                spotlight.sendRequest(tweet.text, function (output) {
                    console.log('*********************************');
                    console.log(tweet.text);
                    if (output.Resources != undefined) {
                        //store tweets on DB
                        _this.addToDB(tweet, output);

                        _.each(output.Resources, function (resource) {
                            //do not count search keywords
                            if (!_.contains(watchSymbols, resource['@surfaceForm'])) {

                                //Tell the twitter API to filter on the watchSymbols
                                _this.updateWatchListSymbol(resource);

                                tweet.text = tweet.text.replace(resource['@surfaceForm'], '&nbsp;<span resource="' + resource['@URI'] + '" class="r_entity r_' + _this.getEntityType(resource['@types']).toLowerCase() + '" typeOf="' + resource['@types'] + '">' + resource['@surfaceForm'] + '</span>&nbsp;');
                            }
                        });
                        //Send to all the clients
                        _this.watchList.tweets_no++;
                        _this.watchList.recent_tweets.push({text: tweet.text, date: tweet.created_at});
                        //watchList.current_tweet.text=tweet.text;
                        //watchList.current_tweet.date=tweet.created_at;
                    }
                })
            }
        });
        //add a threshold to stop service if we got more than 1000 tweets
        if (_this.watchList.tweets_no > 1000) {
            _this.stopStreaming(stream, sockets);
        }
        //acts as a buffer to slow down emiting results
        setInterval(function () {
            if (_this.send_data) {
                sockets.sockets.emit('data', _this.watchList);
                _this.watchList.recent_tweets = [];
                _this.send_data = 0;
            }
        }, 1500);
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

_this.emptyWatchList = function () {
    this.watchList.tweets_no = 0;
    this.watchList.total = 0;
    this.watchList.recent_tweets = [];
    this.watchList.symbols = {}
};
_this.stopStreaming = function (stream, sockets) {
    //Reset collection
    db.get('tweetscollection').drop();
    console.log('stop streaming...');
    this.emptyWatchList();
    stream.destroy();
    sockets.sockets.emit('data', this.watchList);
    sockets.sockets.emit('stop', {});
};

_this.addToDB = function (tweet, output) {
    db.get('tweetscollection').insert({
        "tweet_id": tweet.id,
        "user_name": tweet.user.screen_name,
        "created_at": tweet.created_at,
        "place": tweet.place,
        "processed": output
    });
};

_this.updateWatchListSymbol = function (resource) {
    if (this.watchList.symbols[resource['@surfaceForm']] == undefined) {
        this.watchList.symbols[resource['@surfaceForm']] = {
            count: 1,
            type: this.getEntityType(resource['@types']),
            uri: resource['@URI']
        };
        /*console.log('------>' + resource['@surfaceForm']);
        console.log('------>type: ' + getEntityType(resource['@types']));*/
    } else {
        this.watchList.symbols[resource['@surfaceForm']].count++;
        //Increment total
        this.watchList.total++; //TODO: Check what Total is for (why not incremented after the if else block?
        //limit for demo
        if (Object.keys(this.watchList.symbols).length > 400) {
            this.pause_streaming = 1;
        }
        //console.log(watchList);
    }
};

_this.getEntityType = function (types_str) {
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
_this.removeWeakSymbols = function (watchList) {
    var filtered_list = {};
    var removed_ones = {};
    // calculate the count of symbols
    var symbols_no = Object.keys(watchList.symbols).length;
    if (symbols_no > 20) {
        _.each(watchList.symbols, function (v, i) {
            if (v.count > 1) {
                filtered_list[i] = v;
            } else {
                removed_ones[i] = v;
            }
        });
        watchList.symbols = filtered_list;
    }
    return removed_ones;
};

module.exports = Annotator;
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