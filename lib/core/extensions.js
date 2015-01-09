/**
 * Created by Ugochimbo on 12/20/2014.
 */

var config = require('./../../config.js');
var twitter = require('twitter');

function Extensions() {

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

}

Extensions.prototype = {

    isGuarded: function (key) {},

    isParamUpdatable: function (params, key) {},

    setParams: function (params){}

};

module.exports = Extensions;