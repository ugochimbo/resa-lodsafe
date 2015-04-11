
////// Ext Handler Factory

/**
 *
 * @constructor
 */
function ExtensionHandlerFactory(){

    /**
     *
     * @param extName
     * @returns {*}
     */
    this.createExtensionHandlerObject = function(extName) {
        if (extName === 'lodsafe')
            return new LodsafeHandler();

        return new ResaHandler();
    }

}
