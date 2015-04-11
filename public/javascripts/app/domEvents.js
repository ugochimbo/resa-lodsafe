
//************ DOM Events *************//

//** TODO: Refactor view.. Unclean code **//

/**
 *
 */
function startAnalyzing(){
    appHandler.startAnalyzing();
}

/**
 *
 */
function pauseAnalyzing() {
   appHandler.pauseAnalyzing();
}

/**
 * 
 */
function stopAnalyzing() {
    appHandler.stopAnalyzing();
}

//** Extension Change **//
$("#extensions-list").on( "change", function() {
    appHandler.handleExtensionChange();
});

