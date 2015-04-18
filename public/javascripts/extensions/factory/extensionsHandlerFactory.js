
////// Ext Handler Factory

function ExtensionHandlerFactory(){

    this.createExtensionHandlerObject = function(extName) {
        if (extName === 'lodsafe')
            return new LodsafeHandler();

        return new ResaHandler();
    }

}
