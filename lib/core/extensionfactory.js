var Resa = require('./../resa/resa.js');
var Lodsafe = require('./../lodsafe//lodsafe.js');

function ExtensionFactory() {

    this.resa = new Resa();
    this.lodsafe = new Lodsafe();

    this.createObject = function (type) {

        if (type === 'lodsafe')
            return this.lodsafe;

        else
            return this.resa;

    };

    this.initObject = function (extName) {
        var ext = this.createObject(extName);
        ext.init();

        return ext;
    }
}

module.exports = ExtensionFactory;