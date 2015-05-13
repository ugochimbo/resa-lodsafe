
var Resa = require('../resa/resa.js');
var util = require('util');
var _ = require('underscore');
var Geocoder = require('../helpers/geocoder.js');

/**
 * Lodsafe : Location Based Filtering Extension for ReSA
 * @constructor
 */
function Lodsafe() {

    Resa.call(this);
    var _this = this;
    this.geocoder = new Geocoder();

    this.watchList.countries = {};
    this.watchList.geocoordinates = [];

    /**
     * Instantiate extension parameters
     * @function initParams
     * @override
     */
    this.initParams = function (){
        /**
         * @property {object} params - Extension parameters / properties
         * @property {string} params.name - Extension name
         * @property {string} params.strict - Location settings mode
         * @property {object} params.visualizations - Extension visualizations
         * @property {string} params.visualizations.name - Extension visualizations name
         * @property {string} params.visualizations.title - Extension visualizations title
         */
        this.params = {
            name : 'lodsafe',
            strict : true,
            visualizations : [
                {'name': 'bubblecloud', 'title': 'Entities Bubble Cloud'},
                {'name': 'lodsafe-facet', 'title': 'Location Facet'},
                {'name': 'map', 'title': 'Tweet Map'}
            ]
        };
    };

    /**
     * Handle Annotated Tweet Callback
     * @override
     * @function annotateCallback
     * @param tweet {object} - Tweet Object
     * @param output {object} - Dbpedia Response
     */
    this.annotateCallback = function (tweet, output) {
        var resources = output.response.Resources;
        if (resources !== undefined) {
            _.each(resources, function (resource) {
                //do not count search keywords
                if (!_.contains(_this.watchList.search_for, resource['@surfaceForm'])) {
                    _this.updateWatchListSymbol();
                    _this.annotateTweetTextWithResource(resource, tweet);
                    _this.updateEntityBubblecloudData(resource, tweet);
                }
            });
            _this.updateWatchListTweet(tweet);
            _this.updateViewData(tweet);
        }

    };

    this.customPostEmit = function () {
        this.watchList.countries = {};
        this.watchList.geocoordinates = [];
    };

    /**
     * Check if property is guarded/protected
     * @override
     * @function isGuarded
     * @param key {string} - Guarded property
     * @returns {boolean}
     */
    this.isGuarded = function (key) {
        return _.contains(this.guarded, key);
    };

    /**
     * Check if tweet has a text and location
     * @override
     * @function isValidTweet
     * @param tweet {object} - Tweet Object
     * @returns {boolean}
     */
    this.isValidTweet = function (tweet) {

        if(!this.params.strict)
            return tweet.text !== undefined;

        return (tweet.text !== undefined && tweet.place !== null);
    };

    this.updateViewData = function (tweet) {
        this.updateCountryFacetData(tweet);
        this.updateMapData(tweet);
    };

    /**
     * @function updateEntityBubblecloudData
     * @param resource {object} - Dbpedia Resource
     * @param tweet {object} - Tweet Object
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
     * Update Country Facet Data
     * @function updateCountryFacetData
     * @param tweet {object} - Tweet Object
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

    this.updateMapData = function (tweet) {
        var coordinate = this.getTweetGeoCoordinates(this.getTweetFullPlace(tweet));
        this.watchList.geocoordinates.push(coordinate);
    };

    /**
     * Update Object WatchList Symbol
     * @override
     * @function updateWatchListSymbol
     */
    this.updateWatchListSymbol = function () {
        this.updateWatchListTotal();
        this.limitForDemo();
    };

    /**
     * Update Object WatchList Tweet
     * @override
     * @function updateWatchListTweet
     * @param tweet {object} - Tweet Object
     */
    this.updateWatchListTweet = function (tweet) {
        this.watchList.tweets_no++;
        this.watchList.recent_tweets.push({text: tweet.text, date: tweet.created_at, location: this.getTweetCountry(tweet)});
    };

    this.getTweetGeoCoordinates = function(address) {
        return this.geocoder.getGeoCode(address);
    };

    /**
     * Get country of tweet
     * @function getTweetCountry
     * @param tweet {object} - Tweet Object
     * @returns {string}
     */
    this.getTweetCountry = function (tweet){
        return tweet.place != null ? tweet.place.country : 'N/A';
    };

    /**
     * Get country code of tweet
     * @function getTweetCountryCode
     * @default [null]
     * @param tweet {object} - Tweet Object
     * @returns {string}
     */
    this.getTweetCountryCode = function(tweet) {
        return tweet.place !== null ? tweet.place.country_code : 'N/A';
    };

    /**
     * Get tweet city
     * @function getTweetCity
     * @default [null]
     * @param tweet {object} - Tweet Object
     * @returns {string}
     */
    this.getTweetCity = function(tweet) {
        return tweet.place == "city" ? tweet.place.name : 'N/A';
    };

    this.getTweetFullPlace = function (tweet) {
        return tweet.place.full_name;
    };

}

util.inherits(Lodsafe, Resa);

module.exports = Lodsafe;