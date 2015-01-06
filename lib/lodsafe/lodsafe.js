var util = require('util');
var Resa = require('../core/resa.js');

function Lodsafe() {

    this.params = {
        name : 'lodsafe',
        strict : true,
        visualizations : ['bubblecloud']
    };

    this.isValidTweet = function (tweet) {

        if(!this.params.strict)
            return tweet.text !== undefined;

        return (tweet.text !== undefined && tweet.place !== null);
    };

    this.updateWatchListSymbol = function (resource, tweet) {

        if (this.output.symbols[resource['@surfaceForm']] == undefined) {
            this.output.symbols[resource['@surfaceForm']] = {
                count: 1,
                type: this.getEntityType(resource['@types']),
                uri: resource['@URI'],
                tweet_from: [this.getTweetLocation(tweet)]
            };
        } else {
            this.output.symbols[resource['@surfaceForm']].tweet_from.push(this.getTweetLocation(tweet));
            this.output.symbols[resource['@surfaceForm']].count++;
            //Increment total
            this.output.total++;
            //limit for demo
            if (Object.keys(this.output.symbols).length > 400) {
                this.pause_streaming = 1;
            }
        }
    };

    this.updateWatchListTweet = function (tweet) {
        this.output.tweets_no++;
        this.output.recent_tweets.push({text: tweet.text, date: tweet.created_at, location: this.getTweetLocation(tweet)});
    };

    this.getTweetLocation = function (tweet){
        return this.params.strict ? tweet.place.country : 'N/A';
    };

    Resa.call(this);
}

util.inherits(Lodsafe, Resa);

module.exports = Lodsafe;