var util = require('util');
var Resa = require('./resa.js');

function Lodsafe() {

    this.isValidTweet = function () {
        console.log("**********In Lodsafe************");
        return (this.tweet.text !== undefined && this.tweet.place !== null);

    };

    Resa.call(this);
}


util.inherits(Lodsafe, Resa);

module.exports = Lodsafe;