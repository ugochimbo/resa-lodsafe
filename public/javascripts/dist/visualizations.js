
/************************** Visualizations  Factory **************************/

function Visualizations() {

    var _this = this;
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

    /*
    if ( arguments.callee._singletonInstance )
        return arguments.callee._singletonInstance;

    arguments.callee._singletonInstance = this;
     */

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
        var n_value=d3.select(this).select("text")[0][0].textContent;
        var uri=d3.select(this).select("text")[0][0].__data__.uri;
        var desc = getResourceDescription(uri);

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

/********************************** Visualizations  *********************************/

/* :::::::: Lodsafe Facet :::::::: */

function LodsafeFacet() {

    if ( arguments.callee._singletonInstance )
        return arguments.callee._singletonInstance;

    arguments.callee._singletonInstance = this;

    Visualizations.call(this);

    var data = [];
    var _this = this;

    this.initVisualization = function(){
        var facetDiv = $('#lodsafe-facet');
        if (!$("#lodsafe-facets-content").length) {
            facetDiv.append("<div id='lodsafe-facets-content'></div><div id='lodsafe-results'></div>");
        }
        attachDescriptionHandler();
    };

    this.updateVisualization = function(newData, params){

        for (var key in newData.countries) {
            data.push(newData.countries[key]);
        }

        $.facetelize(_this.settings);
    };

    this.item_template =
                '<div class="item left">' +
                    '<p class="tags">' +
                        '<% if (obj.country) {  %> <%= obj.continent %><% } %>' +
                        '<% if (obj.city) {  %><%= obj.category %><% } %>' +
                    '</p>' +
                    '<p class="desc"><%= obj.tweet %></p>' +
                '</div>';

    this.settings = {
        items           : data,
        facets          : {
            'country'    : 'Country',
            'city'     : 'City'
        },
        resultSelector  : '#lodsafe-results',
        facetSelector   : '#lodsafe-facets-content',
        orderByOptions  : {'country': 'Country', 'city': 'City'},
        resultTemplate  : this.item_template
    };

}

var lodsafe_facet = new LodsafeFacet();
/**
 * Created by Ugochimbo on 5/1/2015.
 */

function Map() {

    Visualizations.call(this);

    this.map = null;
    this.data = [];

    var _this = this;

    this.initMap = function() {

        var mapOptions = {
            center: { lat: 50.7323, lng: 7.1847},
            zoom: 2
        };

        this.map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    };

    this.initVisualization = function(){
        var mapDiv = $('#map');
        if (!$("#map-canvas").length) {
            mapDiv.append("<div id='map-canvas' style='width: 1020px; height: 900px; margin-top: 10px'></div>");
            google.maps.event.addDomListener(window, 'load', this.initMap());
        }
    };

    this.updateVisualization = function(newData, params){
        for (var data in newData.mapdata) {
            plotToMap(newData.mapdata[data]);
        }
    };

    var plotToMap = function(data){
        var latLng = new google.maps.LatLng(data.coordinate[0], data.coordinate[1]);

        var marker = new google.maps.Marker({
            map: _this.map,
            position: latLng,
            title: data.text
        });

        addInfoWindow(marker, data.text);
    };

    var addInfoWindow = function(marker, info){
        var infowindow = new google.maps.InfoWindow({
            content: info
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(_this.map,marker);
        });
    }

}

var map = new Map();

/// Viz Factory

function VisualizationFactory(){

    this.createVisualizationObject = function(visualizationName) {
        if (visualizationName === 'lodsafe-facet')
            return lodsafe_facet;

        else if (visualizationName === 'map')
            return map;

        return bubble_cloud;
    }

}
