
//************ Sockets *************//

var socket = io.connect(window.location.hostname);

socket.on('data', function(data) {
    appHandler.onSocketData(data);
});

socket.on('stop', function(data) {
    appHandler.stopAnalyzing();
});

socket.on('pause', function(data) {
    appHandler.setGlobPaused(1);
    appHandler.pauseAnalyzing();
});

