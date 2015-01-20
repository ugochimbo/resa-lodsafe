

/************************** App  Handler **************************/
   var base = new Base();
   var extensionHandlerFactory = new ExtensionHandlerFactory();
   var visualizationObject  = base.getCurrentVisualizationObject();

   var socket = io.connect(window.location.hostname);

    function loadExtensionParams(extName) {
        base.loadExtensionParams(extName);
        var extensionHandler = extensionHandlerFactory.createExtensionHandlerObject(extName);
        extensionHandler.init();
    }

    $("#extensions-list").on( "change", function() {
        var selected =  $("#extensions-list").find("option:selected").attr('value');
        loadExtensionParams(selected);
    });

    socket.on('data', function(data) {
        console.log("************* Data: " + JSON.stringify(data));

        var params = {
            total: data.total,
            symbols_no: Object.keys(data.watchList.symbols).length,
            max_ent:  400
        };

        updateTopPanelInfo(data.watchList, params);

        //Right Panel (Tweet Stream)
        updateTwitterStream(data.watchList);

        base.setExtensionParams(data.params);

        loadExtensionParams(data.params.name);

        base.loadExtensionVisualizations(data.params.name);

        //Main Panel (Viz)
        visualizationObject.updateVisualization(data.watchList, params);

        $('#last-update').text(new Date().toTimeString());
    });

    socket.on('stop', function(data) {
        stopAnalyzing();
    });

    socket.on('pause', function(data) {
        base.setGlobPaused(1);
        pauseAnalyzing();
    });

    function updateTwitterStream(data)
    {
        $('#hashtag').html(' (#'+data.search_for.join()+')').addClass("animated bounceIn");
        $('.tweet').removeClass('animated').removeClass('flash');
        $('.r_entity').css('background-color','');
        $.each(data.recent_tweets,function(i,v){
            $('#tweets').prepend('<div class="tweet animated slideInDown recent">' +
            '<div class="tweet-date">' + v.date + '</div>' +
            '<div class="tweet-location">' + (v.hasOwnProperty('location') ? v.location : '') + '</div>'+
            v.text+'</div>')
                .linkify({target: '_blank'});
        });
    }

    function updateTopPanelInfo(data, params)
    {
        if(params.symbols_no > params.max_ent){
            pauseAnalyzing();
            alert('The demo is limited to '+max_ent+' entities! contact us for more info: khalili@informatik.uni-leipzig.de');
        }

        /*var avg_no = params.total / params.symbols_no;
         var slug_text = '';*/
        $('#symbols_no').html(params.symbols_no).addClass("animated bounceIn");
        $('#tweets_no').html(data.tweets_no).addClass("animated bounceIn");
        if(data.tweets_no>0 && !base.getGlobPaused()){
            establishPauseMode();
        }else{
            base.setGlobPaused(0);
        }
    }

    function startAnalyzing(){
        base.setGlobPaused(0);
        var terms = $('#keyword').val();
        if(!$.trim(terms)){
            return 0;
        }
        establishPauseMode();
        var socket2 = io.connect(window.location.hostname);
        var data = {
            keywords : terms.split(','),
            extParams : base.getExtensionParams()
        };
        socket2.emit('startA', data);
    }

    function stopAnalyzing(){
        $('#reset_btn').addClass('animated bounceIn');
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('stopA', {});
        setTimeout(function(){
            socket2.emit('removeAll', {});
            visualizationObject.remove();
            $('#tweets').empty();
        },1000);

        var process_button = $('#process_btn');

        process_button.find('i').removeClass('glyphicon-pause').addClass('glyphicon-play');
        process_button.removeClass('btn-warning').addClass('btn-success').attr('title','start').removeClass('bounceIn').addClass('animated bounceIn').attr('onclick','startAnalyzing();');
    }

    function pauseAnalyzing(){
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('pauseA', {});

        var process_button = $('#process_btn');

        process_button.find('i').removeClass('glyphicon-pause').addClass('glyphicon-play');
        process_button.removeClass('btn-warning').addClass('btn-success').attr('title','start').removeClass('bounceIn').addClass('animated bounceIn').attr('onclick','startAnalyzing();');
    }
    function removeAllEntities(){
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('removeAll', {});
    }
    function establishPauseMode(){
        var process_button = $('#process_btn');
        process_button.find('i').removeClass('glyphicon-play').addClass('glyphicon-pause');
        process_button.removeClass('btn-success').addClass('btn-warning').attr('title','pause').addClass('animated bounceIn').attr('onclick','pauseAnalyzing();');
    }