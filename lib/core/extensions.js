/**
 * Created by Ugochimbo on 12/20/2014.
 */

var ExtensionFactory = require('./extensionfactory');

function Extensions() {
    this.extensionFactory = new ExtensionFactory();

    this.getExtensionObject = function (extName) {
        var ext = this.extensionFactory.createObject(extName);
        ext.init();

        return ext;
    }
}

module.exports = Extensions;