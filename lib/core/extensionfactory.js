/**
 *
 * @type {Resa|exports}
 */
var Resa = require('./../resa/resa.js');

/**
 *
 * @type {exports}
 */
var Lodsafe = require('./../lodsafe//lodsafe.js');

/**
 *
 * @constructor
 */
function ExtensionFactory() {

    this.extensions = {
        'resa' : new Resa(),
        'lodsafe': new Lodsafe()
    };

    /**
     *
     * @param name
     * @returns {*}
     */
    this.createObject = function (name) {
       return this.extensions[name];
    };

    /**
     *
     * @param extName
     * @returns {*}
     */
    this.initObject = function (extName) {
        var ext = this.createObject(extName);
        ext.init();

        return ext;
    }
}

module.exports = ExtensionFactory;