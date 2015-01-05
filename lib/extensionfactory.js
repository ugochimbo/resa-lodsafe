var Resa = require('./resa.js');
var Lodsafe = require('./lodsafe.js');

function ExtensionFactory() {

    this.resa = new Resa();
    this.lodsafe = new Lodsafe();

    this.createObject = function (type) {

        if (type === 'lodsafe')
            return this.lodsafe;

        else
            return this.resa;

    }
}

module.exports = ExtensionFactory;