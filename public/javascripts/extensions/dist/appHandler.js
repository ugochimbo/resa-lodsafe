$(function(){

    var glob_paused=0;
    var extParams = {};

    socket.on('data', function(data) {
        console.log("************* Data: " + JSON.stringify(data));

        var params = {
            one_node_already_inserted: 0,
            total: data.total,
            symbols_no: Object.keys(data.watchList.symbols).length,
            max_ent:  400
        };

        setExtensionParams(data.params);

        updateTopPanelInfo(data.watchList, params);

        //Right Panel (Tweet Stream)
        updateTwitterStream(data.watchList);

        //Main Panel (Viz)
        updateVisualization(data.watchList, params);

        restart();

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

    function updateVisualization(data, params)
    {
        var slug_text = "";
        for (var key in data.symbols) {
            var val = data.symbols[key].count / params.total;
            if (isNaN(val)) {
                val = 0;
            }
            slug_text=convertToSlug(key);
            //console.log(d3.select("#bubblecloud svg").selectAll('.node'));

            //Add New Bubble
            if(!d3.select("#bubblecloud svg").selectAll('.node-circle[id="' + slug_text + '"]').size()){
                var start_x=width/2;
                var start_y=height/2;
                if(params.one_node_already_inserted>0){
                    //prevent collision
                    start_y=start_y-(params.one_node_already_inserted*15);
                }
                //var category=Math.floor(20*Math.random());
                var c_size=rScale(data.symbols[key].count);
                var uri=data.symbols[key].uri;
                var node = {x: start_x, y:start_y, name:key,n_weight:data.symbols[key].count, category:data.symbols[key].type, r:c_size, proportion:val,slug_text:slug_text,uri:uri},
                    n = nodes.push(node);
                params.one_node_already_inserted++;
            }
            else{
                //Update Existing Bubble
                var new_size=rScale(data.symbols[key].count);
                if(d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r')!=new_size){
                    d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r',new_size/2).transition().duration(700).attr('r',new_size);
                }
            }
        }
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