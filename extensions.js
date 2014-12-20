/**
 * Created by Ugochimbo on 12/20/2014.
 */

var ExtensionFactory = require('./extensionfactory');

function Extensions() {
    this.extensionFactory = new ExtensionFactory();

    this.getExtensionObject = function (ext) {
       return this.extensionFactory.createObject(ext);
    }
}

module.exports = Extensions;