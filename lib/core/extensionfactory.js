/**
 *
 * @type {Resa|exports}
 */
var Resa = require('./../extensions/resa/resa.js');

/**
 *
 * @type {exports}
 */
var Lodsafe = require('./../extensions/lodsafe//lodsafe.js');

/**
 *
 * @constructor
 */
function ExtensionFactory() {

    /**
     *
     * @param type
     * @returns {*}
     */
    this.createObject = function (type) {

        if (type === 'lodsafe')
            return new Lodsafe();

        else
            return new Resa();

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