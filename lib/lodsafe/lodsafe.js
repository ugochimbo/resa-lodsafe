//var util = require('util');

/**
 *
 * @type {Resa|exports}
 */
var Resa = require('../resa/resa.js');
var util = require('util');
var _ = require('underscore');

/**
 *
 * @constructor
 */
function Lodsafe() {

    Resa.call(this);
    var _this = this;

    /**
     *
     * @type {{}}
     */
    this.watchList.countries = {};

    /**
     *
     */
    this.initParams = function (){
        /**
         *
         * @type {{name: string, strict: boolean, visualizations: {name: string, title: string}[]}}
         */
        this.params = {
            name : 'lodsafe',
            strict : true,
            visualizations : [
                {'name': 'bubblecloud', 'title': 'Entities Bubble Cloud'},
                {'name': 'lodsafe-facet', 'title': 'Location Facet'},
                {'name': 'foursquare-facet', 'title': 'Four Square Facet'}
            ]
        };
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
        this.updateCountryFacetData(tweet);
    };

    /**
     *
     * @param key
     * @returns {*}
     */
    this.isGuarded = function (key) {
        return _.contains(this.guarded, key);
    };

    /**
     *
     * @param tweet
     * @returns {boolean}
     */
    this.isValidTweet = function (tweet) {

        if(!this.params.strict)
            return tweet.text !== undefined;

        return (tweet.text !== undefined && tweet.place !== null);
    };

    /**
     *
     * @param resource
     * @param tweet
     */
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

    /**
     *
     * @param tweet
     */
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

    /**
     *
     * @param resource
     * @param tweet
     */
    this.updateWatchListSymbol = function (resource, tweet) {
        this.updateEntityBubblecloudData(resource, tweet);
        this.updateWatchListTotal();
        this.limitForDemo();
    };

    /**
     *
     * @param tweet
     */
    this.updateWatchListTweet = function (tweet) {
        this.watchList.tweets_no++;
        this.watchList.recent_tweets.push({text: tweet.text, date: tweet.created_at, location: this.getTweetCountry(tweet)});
    };

    /**
     *
     * @param tweet
     * @returns {*|LodsafeFacet.settings.facets.country}
     */
    this.getTweetCountry = function (tweet){
        return tweet.place != null ? tweet.place.country : 'N/A';
    };

    /**
     *
     * @param tweet
     * @returns {*}
     */
    this.getTweetCountryCode = function(tweet) {
        return tweet.place !== null ? tweet.place.country_code : 'N/A';
    };

    /**
     *
     * @param tweet
     * @returns {*}
     */
    this.getTweetCity = function(tweet) {
        return tweet.place == "city" ? tweet.place.name : 'N/A';
    };

}

util.inherits(Lodsafe, Resa);

module.exports = Lodsafe;