

/************************** App  Handler **************************/

$(function(){

   var base = new Base();

   var socket = io.connect(window.location.hostname);

    socket.on('data', function(data) {
        console.log("************* Data: " + JSON.stringify(data));


        base.initVisualizations(data.params.visualizations);

        var params = {
            total: data.total,
            symbols_no: Object.keys(data.watchList.symbols).length,
            max_ent:  400
        };

        updateTopPanelInfo(data.watchList, params);

        //Right Panel (Tweet Stream)
        updateTwitterStream(data.watchList);

        base.setExtensionParams(data.params);
        base.setExtensionVisualizations(data);

        var visualizationObject  = base.getCurrentVisualizationObject();
        //Main Panel (Viz)
        visualizationObject.updateVisualization(data.watchList, params);

        $('#last-update').text(new Date().toTimeString());
    });

    socket.on('stop', function(data) {
        stopAnalyzing();
    });

    socket.on('pause', function(data) {
        glob_paused=1;
        pauseAnalyzing();
    });

    var setExtensionParams = function (params) {
        extParams = params;
    };

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
        if(data.tweets_no>0 && !glob_paused){
            establishPauseMode();
        }else{
            glob_paused=0;
        }
    }

    function startAnalyzing(){
        glob_paused=0;
        var terms=$('#keyword').val();
        if(!$.trim(terms)){
            return 0;
        }
        establishPauseMode();
        var socket2 = io.connect(window.location.hostname);
        var data = {
            keywords : terms.split(','),
            extParams      : extParams
        };
        socket2.emit('startA', data);
    }

    function stopAnalyzing(){
        $('#reset_btn').addClass('animated bounceIn');
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('stopA', {});
        setTimeout(function(){
            socket2.emit('removeAll', {});
            d3.select("#bubblecloud svg").selectAll('g').remove();
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
});