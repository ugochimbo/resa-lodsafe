var util = require('util');
var Resa = require('./resa.js');

function Lodsafe() {
    Resa.call(this);
}

util.inherits(Lodsafe, Resa);

this.isValidTweet = function () {
    console.log("**********In Lodsafe************");
    return (this.tweet.text !== undefined && this.tweet.place !== null);

};

module.exports = Lodsafe;