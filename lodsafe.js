var util = require('util');
var Resa = require('./resa.js');

function Lodsafe() {

    this.strict_mode = true; //Only tweets with places allowed.

    this.isValidTweet = function (tweet) {

        if(!this.strict_mode)
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
        return this.strict_mode ? tweet.place.country : 'N/A';
    };

    Resa.call(this);
}

util.inherits(Lodsafe, Resa);

module.exports = Lodsafe;