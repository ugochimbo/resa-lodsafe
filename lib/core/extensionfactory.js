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

    this.resa = new Resa();
    this.lodsafe = new Lodsafe();

    /**
     *
     * @param type
     * @returns {*}
     */
    this.createObject = function (type) {

        if (type === 'lodsafe')
            return this.lodsafe;

        else
            return this.resa;

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