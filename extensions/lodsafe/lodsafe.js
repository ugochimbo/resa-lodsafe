var config = require('./../config.js');
var util = require('util');
var Annotator = require(config.get['app_root'] + 'annotator.js');

function Lodsafe() {
    Annotator.apply(this, arguments);
}

util.inherits(Lodsafe, Annotator);

module.exports = Lodsafe;