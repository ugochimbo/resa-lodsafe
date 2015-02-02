
/************************** Visualizations  Factory **************************/

function Visualizations() {

    this.svg = null;
    this.width = 900;
    this.height = 900;

}

Visualizations.prototype = {
    initVisualization: function(data) {},   
    updateVisualization: function (data) {},
    remove: function() {}
};

/********************************** Visualizations  *********************************/

/* :::::::: Bubblecloud :::::::: */

function Bubblecloud() {

    if ( arguments.callee._singletonInstance )
        return arguments.callee._singletonInstance;

    arguments.callee._singletonInstance = this;

    Visualizations.call(this);

    var force;
    var nodes;
    var node;
    var _this = this;
    
    var data_types_no = 20;

    this.one_node_already_inserted = 0;

    //var color = d3.scale.category10().domain(d3.range(data_types_no));
    this.color = function(entity_type){
        if(entity_type=='Person'){
            return '#d1ebbc';
        }else if(entity_type=='Place'){
            return '#b7d1e7';
        }else if(entity_type=='Organization'){
            return '#da808d';
        }else{
            return '#fdf8ca';
        }
    };

    //clustering point
    this.cluster_padding_x = this.width/4;
    this.cluster_padding_y = this.height/4;

    this.foci = [{x: (this.width/2) - this.cluster_padding_x, y: (this.height/2) - this.cluster_padding_y},
                {x: (this.width/2) + this.cluster_padding_x, y: (this.height/2) - this.cluster_padding_y},
                {x: (this.width/2) - this.cluster_padding_x, y: (this.height/2) + this.cluster_padding_y},
                {x: (this.width/2) + this.cluster_padding_x, y: (this.height/2) + this.cluster_padding_y}];

    this.foci_category = function(entity_type){
        if(entity_type == 'Person'){
            return this.foci[0];
        }else if(entity_type == 'Place'){
            return this.foci[1];
        }else if(entity_type == 'Organization'){
            return this.foci[2];
        }else{
            return this.foci[3];
        }
    };
    /*
     var category_no = d3.scale.ordinal()
     .domain(["Person", "Place", "Organization"])
     .range(d3.range(3));
     */
    this.category_no = function(entity_type){
        if(entity_type == 'Person'){
            return 1;
        }else if(entity_type == 'Place'){
            return 2;
        }else if(entity_type == 'Organization'){
            return 3;
        }else{
            return 0;
        }
    };

    this.initVisualization = function (){

        if(d3.select("#bubblecloud svg").node() === null) {
            this.svg = d3.select("#bubblecloud").append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            this.svg.append("rect")
                .attr("width", this.width)
                .attr("height", this.height);


            force = d3.layout.force()
                .size([this.width, this.height])
                .nodes([{}]) // initialize with a single node
                .links([])
                .gravity(0.18)
                .charge(-360)
                .friction(0.94)
                .on("tick", this.tick);

            nodes = force.nodes();
        }
    };

    this.updateVisualization = function(data, params) {

        var slug_text = "";

        for (var key in data.symbols) {
            var val = data.symbols[key].count / params.total;
            if (isNaN(val)) {
                val = 0;
            }
            slug_text = convertToSlug(key);

            //Add New Bubble
            if (!d3.select("#bubblecloud svg").selectAll('.node-circle[id="' + slug_text + '"]').size()) {
                var start_x = _this.width / 2;
                var start_y = _this.height / 2;
                if (_this.one_node_already_inserted > 0) {
                    //prevent collision
                    start_y = start_y - (_this.one_node_already_inserted * 15);
                }
                //var category=Math.floor(20*Math.random());
                var c_size = _this.rScale(data.symbols[key].count);
                var uri = data.symbols[key].uri;
                var new_node = {
                    x: start_x,
                    y: start_y,
                    name: key,
                    n_weight: data.symbols[key].count,
                    category: data.symbols[key].type,
                    r: c_size,
                    proportion: val,
                    slug_text: slug_text,
                    uri: uri
                };
                var n = nodes.push(new_node);
                _this.one_node_already_inserted++;
            }
            else {
                //Update Existing Bubble
                var new_size = _this.rScale(data.symbols[key].count);
                if (d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r') != new_size) {
                    d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r', new_size / 2).transition().duration(700).attr('r', new_size);
                }
            }
        }

        this.restart();
    };

    this.remove = function(){
        d3.select("#bubblecloud svg").selectAll('g').remove();
    };

    this.mouseover = function () {
        d3.select(this).select("circle")
            .style("stroke-width", 3);
        //d3.select(this).select("text").attr("opacity", 0.9);
        //console.log(d3.select(this).select("text"));
        var n_value=d3.select(this).select("text")[0][0].textContent;
        var uri=d3.select(this).select("text")[0][0].__data__.uri;
        var tmp=uri.split('http://dbpedia.org/resource/');
        var desc='';
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=1&QueryString="+tmp[1],
            async:false
        }).done(function( data ) {
            //console.log(data)
            desc=data.results[0].description
        });
        if(!desc){
            desc='';
        }
        $(d3.select(this).select("circle")).popover({
            'title': '<b>'+n_value+'</b>',
            'html':true,
            'content': '<a href="'+uri+'">'+uri+'</a><div style="text-align:justify">'+desc+'</div>',
            'container':'body'
        }).popover("show")
    };

    this.mouseout = function() {
        if(! d3.select(this).classed('node-selected')){
            d3.select(this).select("circle")
                .style("stroke-width", 1);
            d3.select(this).select("text").attr("opacity", 0);
        }
        $('.popover').remove();
    };

    this.mousedown = function() {
        if(! d3.select(this).classed('node-selected')){
            d3.select(this).select("circle")
                .style("stroke-width", 3);
            d3.select(this).select("text")
                // .attr("opacity", 0)
                // .attr("style","font-size:5px;")
                //.transition()
                //  .duration(300)
                .attr("style","font-size:1.4em;")
                .attr("opacity", 0.9)
            d3.select(this).classed('node-selected',true);
        }else{
            d3.select(this).classed('node-selected',false);
            d3.select(this).select("text").attr("opacity", 0);
        }
    };

    this.tick = function(e) {
        /*        node.attr("transform", function(d) { return "translate(" + d.x  + "," + d.y+ ")"; }); */
        var k = .1 * e.alpha;

        // Push nodes toward their designated focus.
        nodes.forEach(function(o, i) {
            console.log(o.category);
            o.y += (_this.foci_category(o.category).y - o.y) * k;
            o.x += (_this.foci_category(o.category).x - o.x) * k;
        });

        node.select('circle')
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })


            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    };

   this.restart =  function () {

       node = this.svg.selectAll(".node")
                      .data(nodes);

        var nn = node.enter().insert('g').attr("class", "node")
            .on("mouseover", this. mouseover)
            .on("mouseout", this.mouseout)
            .on("mousedown", this.mousedown)
            .call(force.drag);

        var c_added = nn.append("circle")
            .attr("id",function(d){return d.slug_text;})
            .attr("class", "node-circle")
            .attr("r", 1)
            .style("stroke","#999490")
            .style("stroke-this.width","1")
            .style("fill",function(d){return _this.color(d.category)})
            .transition()
            .duration(500)
            .style("opacity",function(d){return _this.opacScale(d.proportion)})
            .attr("r",function(d){return d.r});

        nn.append("text")
            .attr("id",function(d){return 't_'+d.slug_text;})
            .attr("opacity", 0)
            .attr("text-anchor", "middle")
            .attr("class", "node-text")
            .attr("style","font-size:1.4em;")
            // .attr("style","font-size:5px;")
            .text(function(d){return d.name;});
        // .transition()
        // .duration(500)
        // .attr("style","font-size:1.4em;")

        force.start();
    };

    this.rScale = d3.scale.log()
        .domain([1, 1000])
        .range([12, 80]);

    this.opacScale = d3.scale.log()
        .domain([0, 1])
        .range([0.25, 1]);
}

var bubble_cloud = new Bubblecloud();

/// Viz Factory

function VisualizationFactory(){

    this.createVisualizationObject = function(visualizationName) {
        if (visualizationName === 'bubblecloud')
            return new Bubblecloud();

        return new Bubblecloud();
    }

}


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


/************************** App Scope Object **************************/

function AppScope() {

    var $globals = {
        'glob_paused' : 0,
        'extParams' : {}
    };

    var addVisualizationTab = function (visualizations) {
        var tabAnchor = "";
        var tabContent = "";
        for (var index = 0; index < visualizations.length; ++index) {
            tabAnchor += '<li> <a data-toggle="tab" href="#' + visualizations[index].name +'">' + visualizations[index].title +'</a></li>';
            tabContent += '<div id="' + visualizations[index].name + '" class="tab-pane"></div>';
        }

        $('#visualizations').append(tabAnchor);
        $('#content').append(tabContent);
    };

    var setActiveVisualizationTab = function (){
        $('#visualizations').find('li').first().addClass("active");
        $('#content').find('div').first().addClass("active");
    };

    this.getCurrentVisualizationObject = function() {
        var visualizationName = $(".tab-pane.active").attr('id');
        var visualizationFactory = new VisualizationFactory();
        return visualizationFactory.createVisualizationObject(visualizationName);
    };

    this.getGlobPaused = function () {
        return $globals.glob_paused;
    };

    this.setGlobPaused = function (value) {
        $globals.glob_paused = value;
    };

    this.getExtensionParams = function() {
        return $globals.extParams;
    };

    this.setExtensionParams = function(params){
        $globals.extParams = params;
    };

    this.loadExtensionParams = function(extName){
        var file = "./../params/" + extName + ".html";
        $('#extension-params').load(file);
    };

    this.removeVisualizations = function (){
        $('#visualizations').empty();
        $('#content').empty();
    };

    this.loadExtensionVisualizations = function(extName) {
        if($globals.extParams.name !== undefined || extName !== $globals.extParams.name)
        {
            addVisualizationTab($globals.extParams.visualizations);
            setActiveVisualizationTab();
        }
    };

}

/************************** App Handler **************************/

function AppHandler() {

    var $appScope = new AppScope();
    var extensionHandlerFactory = new ExtensionHandlerFactory();

    this.setGlobPaused = function (value) {
        $appScope.setGlobPaused(value);
    };

    this.isInitData = function (data) {
        return (JSON.stringify($appScope.getExtensionParams()) === '{}' || $appScope.getExtensionParams().name !== data.params.name);
    };

    this.loadExtensionParams = function (extName) {
        $appScope.loadExtensionParams(extName);
        var extensionHandler = extensionHandlerFactory.createExtensionHandlerObject(extName);
        extensionHandler.init();
    };

    this.handleExtensionChange = function () {
        var selected = $("#extensions-list").find("option:selected").attr('value');
        var socket2 = io.connect(window.location.hostname);
        var data = {
            extParams: {name: selected}
        };
        socket2.emit('extChange', data);
    };

    this.initExtensionParams = function (data) {
        $appScope.removeVisualizations();
        $appScope.setExtensionParams(data.params);
        this.loadExtensionParams(data.params.name);
        $appScope.loadExtensionVisualizations(data.params.name);
    };

    this.updateVisualization = function (watchList, params) {
        var visualizationObject = $appScope.getCurrentVisualizationObject();
        visualizationObject.initVisualization();
        visualizationObject.updateVisualization(watchList, params);
    };

    this.updateTwitterStream = function (data) {
        $('#hashtag').html(' (#' + data.search_for.join() + ')').addClass("animated bounceIn");
        $('.tweet').removeClass('animated').removeClass('flash');
        $('.r_entity').css('background-color', '');
        $.each(data.recent_tweets, function (i, v) {
            $('#tweets').prepend('<div class="tweet animated slideInDown recent">' +
            '<div class="tweet-date">' + v.date + '</div>' +
            '<div class="tweet-location">' + (v.hasOwnProperty('location') ? v.location : '') + '</div>' +
            v.text + '</div>')
                .linkify({target: '_blank'});
        });
    };

    this.updateTopPanelInfo = function (data, params) {
        if (params.symbols_no > params.max_ent) {
            this.pauseAnalyzing();
            alert('The demo is limited to ' + max_ent + ' entities! contact us for more info: khalili@informatik.uni-leipzig.de');
        }

        /*var avg_no = params.total / params.symbols_no;
         var slug_text = '';*/
        $('#symbols_no').html(params.symbols_no).addClass("animated bounceIn");
        $('#tweets_no').html(data.tweets_no).addClass("animated bounceIn");

        if (data.tweets_no > 0 && !$appScope.getGlobPaused()) {
            this.establishPauseMode();
        } else {
            this.setGlobPaused(0);
        }
    };

    this.onSocketData = function (data){

        var params = {
            total: data.total,
            symbols_no: Object.keys(data.watchList.symbols).length,
            max_ent:  400
        };

        this.updateTopPanelInfo(data.watchList, params);

        //Right Panel (Tweet Stream)
        this.updateTwitterStream(data.watchList);

        if(this.isInitData(data)) {
            this.initExtensionParams(data);
        }

        //Main Panel (Viz)
        this.updateVisualization(data.watchList, params);

        $('#last-update').text(new Date().toTimeString());
    };

    this.startAnalyzing = function (){
        $appScope.setGlobPaused(0);
        var terms = $('#keyword').val();
        if(!$.trim(terms)){
            return 0;
        }
        this.establishPauseMode();
        var socket2 = io.connect(window.location.hostname);
        var data = {
            keywords : terms.split(','),
            extParams : $appScope.getExtensionParams()
        };
        socket2.emit('startA', data);
    };

    this.stopAnalyzing = function (){
        $('#reset_btn').addClass('animated bounceIn');
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('stopA', {});
        setTimeout(function(){
            socket2.emit('removeAll', {});
            $appScope.getCurrentVisualizationObject().remove();
            $('#tweets').empty();
        },1000);

        var process_button = $('#process_btn');

        process_button.find('i').removeClass('glyphicon-pause').addClass('glyphicon-play');
        process_button.removeClass('btn-warning').addClass('btn-success').attr('title','start').removeClass('bounceIn').addClass('animated bounceIn').attr('onclick','startAnalyzing();');
    };

    this.pauseAnalyzing = function (){
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('pauseA', {});

        var process_button = $('#process_btn');

        process_button.find('i').removeClass('glyphicon-pause').addClass('glyphicon-play');
        process_button.removeClass('btn-warning').addClass('btn-success').attr('title','start').removeClass('bounceIn').addClass('animated bounceIn').attr('onclick','startAnalyzing();');
    };

    this.removeAllEntities = function (){
        var socket2 = io.connect(window.location.hostname);
        socket2.emit('removeAll', {});
    };

    this.establishPauseMode = function (){
        var process_button = $('#process_btn');
        process_button.find('i').removeClass('glyphicon-play').addClass('glyphicon-pause');
        process_button.removeClass('btn-success').addClass('btn-warning').attr('title','pause').addClass('animated bounceIn').attr('onclick','pauseAnalyzing();');
    };

}

var appHandler = new AppHandler();


//************ DOM Events *************//

//** TODO: Refactor view.. Unclean code **//

function startAnalyzing(){
    appHandler.startAnalyzing();
}

function pauseAnalyzing() {
   appHandler.pauseAnalyzing();
}

function stopAnalyzing() {
    appHandler.stopAnalyzing();
}

//** Extension Change **//
$("#extensions-list").on( "change", function() {
    appHandler.handleExtensionChange();
});



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

