
//************ Sockets *************//

var socket = io.connect(window.location.hostname);

socket.on('data', function(data) {

    var params = {
        total: data.total,
        symbols_no: Object.keys(data.watchList.symbols).length,
        max_ent:  400
    };

    appHandler.updateTopPanelInfo(data.watchList, params);

    //Right Panel (Tweet Stream)
    appHandler.updateTwitterStream(data.watchList);

    if(appHandler.isInitData(data)) {
        appHandler.initExtensionParams(data);
    }

    //Main Panel (Viz)
    appHandler.updateVisualization(data.watchList, params);

    $('#last-update').text(new Date().toTimeString());
});

socket.on('stop', function(data) {
    appHandler.stopAnalyzing();
});

socket.on('pause', function(data) {
    appHandler.setGlobPaused(1);
    appHandler.pauseAnalyzing();
});

