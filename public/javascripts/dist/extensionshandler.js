
/************************** Extensions Handlers **************************/

/* :::: ReSA :::: */

    function ResaHandler() {
        this.init = function() {}
    }

/************************** Extensions Handlers **************************/

/* :::: Lodsafe :::: */

    function LodsafeHandler() {
        this.init = function() {
            var lodsafe_mode = $("#lodsafe-mode");

            lodsafe_mode.bootstrapSwitch({
                'state': true,
                'animate': true,
                'handleWidth': 80,
                'onColor': 'success',
                'offColor': 'danger'
            });

            lodsafe_mode.on('switchChange.bootstrapSwitch', function(event, state) {
                if(extParams['strict'] !== undefined)
                    extParams.strict = state;
            });
        }
    }

////// Ext Handler Factory

function ExtensionHandlerFactory(){

    this.createExtensionHandlerObject = function(extName) {
        if (extName === 'lodsafe')
            return new LodsafeHandler();

        return new ResaHandler();
    }

}
