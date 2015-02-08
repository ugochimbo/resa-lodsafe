//var util = require('util');
var Resa = require('../resa/resa.js');
var util = require('util');
var _ = require('underscore');

function Lodsafe() {

    Resa.call(this);

    this.watchList.countries = {};

    this.initParams = function (){
        this.params = {
            name : 'lodsafe',
            strict : true,
            visualizations : [
                {'name': 'bubblecloud', 'title': 'Entities Bubble Cloud'},
                {'name': 'lodsafe-facet', 'title': 'Location Facet'}
            ]
        };
    };

    this.annotateResponse = function (tweet, response) {
        this.prototype.annotateResponse(tweet, response);
        this.updateCountryFacetData(tweet);
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

    this.updateEntityBubblecloudData = function (resource, tweet) {
        if (this.watchList.symbols[resource['@surfaceForm']] == undefined) {
            this.watchList.symbols[resource['@surfaceForm']] = {
                count: 1,
                type: this.getEntityType(resource['@types']),
                uri: resource['@URI'],
                tweet_from: [this.getTweetCountryCode(tweet)]
            };
        } else {
            this.watchList.symbols[resource['@surfaceForm']].tweet_from.push(this.getTweetCountryCode(tweet));
            this.watchList.symbols[resource['@surfaceForm']].count++;
            //Increment total
            this.watchList.total++;
            //limit for demo
            if (Object.keys(this.watchList.symbols).length > 400) {
                this.pause_streaming = 1;
            }
        }
    };

    this.updateCountryFacetData = function (tweet) {

        var countryCode = this.getTweetCountryCode(tweet);

        if (this.watchList.countries[countryCode] == undefined) {
            this.watchList.countries[countryCode] = {
                tweet: tweet.text,
                count: 1,
                city: this.getTweetCity(tweet),
                country: this.getTweetCountry(tweet)
            };
        } else {
            this.watchList.countries[countryCode].count++;
        }
    };

    this.updateWatchListTotal = function () {
        //Increment total
        this.watchList.total++;

        //limit for demo
        if (Object.keys(this.watchList.symbols).length > 400) {
            this.pause_streaming = 1;
        }
    };

    this.updateWatchListSymbol = function (resource, tweet) {
        this.updateEntityBubblecloudData(resource, tweet);
        this.updateWatchListTotal();
    };

    this.updateWatchListTweet = function (tweet) {
        this.watchList.tweets_no++;
        this.watchList.recent_tweets.push({text: tweet.text, date: tweet.created_at, location: this.getTweetCountry(tweet)});
    };

    this.getTweetCountry = function (tweet){
        return tweet.place.country != null ? tweet.place.country : 'N/A';
    };

    this.getTweetCountryCode = function(tweet) {
        return tweet.place.country_code !== null ? tweet.place.country_code : 'N/A';
    };

    this.getTweetCity = function(tweet) {
        return tweet.place.place_type == "city" ? tweet.place.name : 'N/A';
    };

}

util.inherits(Lodsafe, Resa);

module.exports = Lodsafe;