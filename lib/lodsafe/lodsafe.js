//var util = require('util');
var Resa = require('../resa/resa.js');
var util = require('util');

function Lodsafe() {

    Resa.call(this);

    this.initParams = function (){
        this.params = {
            name : 'lodsafe',
            strict : true,
            visualizations : ['bubblecloud']
        };
    };

    this.isGuarded = function (key) {
        return _.contains(this.guarded, key);
    };

    this.isParamUpdatable = function (params, key) {
        return params.hasOwnProperty(key) && !this.isGuarded(key) && this.params[key] !== undefined;
    };

    this.init = function (){
        this.initParams();
        this.setGuarded();
    };

    this.setParams = function (params){
        var _this = this;

        for(var key in params)
        {
            //noinspection JSUnfilteredForInLoop
            if(_this.isParamUpdatable(params, key)) {
                //noinspection JSUnfilteredForInLoop
                _this.params[key] =  params[key];
            }
        }
    };

    this.isValidTweet = function (tweet) {

        if(!this.params.strict)
            return tweet.text !== undefined;

        return (tweet.text !== undefined && tweet.place !== null);
    };

    this.updateWatchListSymbol = function (resource, tweet) {

        if (this.watchList.symbols[resource['@surfaceForm']] == undefined) {
            this.watchList.symbols[resource['@surfaceForm']] = {
                count: 1,
                type: this.getEntityType(resource['@types']),
                uri: resource['@URI'],
                tweet_from: [this.getTweetLocation(tweet)]
            };
        } else {
            this.watchList.symbols[resource['@surfaceForm']].tweet_from.push(this.getTweetLocation(tweet));
            this.watchList.symbols[resource['@surfaceForm']].count++;
            //Increment total
            this.watchList.total++;
            //limit for demo
            if (Object.keys(this.watchList.symbols).length > 400) {
                this.pause_streaming = 1;
            }
        }
    };

    this.updateWatchListTweet = function (tweet) {
        this.watchList.tweets_no++;
        this.watchList.recent_tweets.push({text: tweet.text, date: tweet.created_at, location: this.getTweetLocation(tweet)});
    };

    this.getTweetLocation = function (tweet){
        return this.params.strict ? tweet.place.country : 'N/A';
    };

}

util.inherits(Lodsafe, Resa);

module.exports = Lodsafe;