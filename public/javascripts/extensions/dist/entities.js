
function Extensions() {

    this.params = {};

    this.setParams = function(params) {};

    this.visualizations = ['bubblecloud'];

}

//"""""""""" RESA """""""""""//
var resa = new Extension();

resa.visualizations = ['bubblecloud'];

//"""""""" /RESA """"""""""""//\



//"""""""""" LODSAFE """""""""""//
var lodsafe = new Extension();

lodsafe.params = {
    'strict' : true
};

lodsafe.setParams = function (params) {
  this.params.strict = params.strict;
};

lodsafe.visualizations = [
    'bubblecloud'
];
//"""""""" /LODSAFE """"""""""""//



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