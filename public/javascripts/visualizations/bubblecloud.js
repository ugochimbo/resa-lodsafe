
/********************************** Visualizations  *********************************/

/* :::::::: Bubblecloud :::::::: */

function Bubblecloud() {
    Visualizations.call(this);
    this.data_types_no = 20;
    //this.color = d3.scale.category10().domain(d3.range(data_types_no));
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
    this.foci = [
        {x: (this.width/2) - this.cluster_padding_x, y: (this.height/2) - this.cluster_padding_y},
        {x: (this.width/2) + this.cluster_padding_x, y: (this.height/2) - this.cluster_padding_y},
        {x: (this.width/2) - this.cluster_padding_x, y: (this.height/2) + this.cluster_padding_y},
        {x: (this.width/2) + this.cluster_padding_x, y: (this.height/2) + this.cluster_padding_y}
    ];

    this.foci_category = function(entity_type){
        if(entity_type=='Person'){
            return this.foci[0];
        }else if(entity_type=='Place'){
            return this.foci[1];
        }else if(entity_type=='Organization'){
            return this.foci[2];
        }else{
            return this.foci[3];
        }
    };
    /*
     this.category_no = d3.scale.ordinal()
     .domain(["Person", "Place", "Organization"])
     .range(d3.range(3));
     */
    this.category_no = function(entity_type){
        if(entity_type=='Person'){
            return 1;
        }else if(entity_type=='Place'){
            return 2;
        }else if(entity_type=='Organization'){
            return 3;
        }else{
            return 0;
        }
    };
    this.force = d3.layout.force()
        .size([this.width, this.height])
        .nodes([{}]) // initialize with a single node
        .links([])
        .gravity(0.18)
        .charge(-360)
        .friction(0.94)
        .on("tick", this.tick);

    this.svg = d3.select("#bubblecloud").append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.svg.append("rect")
        .attr("width", this.width)
        .attr("height", this.height);

    this.nodes = this.force.nodes();
    this.node = this.svg.selectAll(".node");
    this.one_node_already_inserted = 0;

    this.updateVisualization = function(data, params){
        var slug_text = "";
        for (var key in data.symbols) {
            var val = data.symbols[key].count / params.total;
            if (isNaN(val)) {
                val = 0;
            }
            slug_text = convertToSlug(key);
            //console.log(d3.select("#bubblecloud svg").selectAll('.node'));

            //Add New Bubble
            if(!d3.select("#bubblecloud svg").selectAll('.node-circle[id="' + slug_text + '"]').size()){
                var start_x = this.width/2;
                var start_y = this.height/2;
                if(this.one_node_already_inserted>0){
                    //prevent collision
                    start_y = start_y-(this.one_node_already_inserted*15);
                }
                //var category=Math.floor(20*Math.random());
                var c_size = rScale(data.symbols[key].count);
                var uri = data.symbols[key].uri;
                var node = {x: start_x, y:start_y, name:key,n_weight:data.symbols[key].count, category:data.symbols[key].type, r:c_size, proportion:val,slug_text:slug_text,uri:uri},
                    n = this.nodes.push(node);
                this.one_node_already_inserted++;
            }
            else{
                //Update Existing Bubble
                var new_size = rScale(data.symbols[key].count);
                if(d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r')!=new_size){
                    d3.select("#bubblecloud svg").select('.node-circle[id="' + slug_text + '"]').attr('r',new_size/2).transition().duration(700).attr('r',new_size);
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
        var n_value = d3.select(this).select("text")[0][0].textContent;
        var uri = d3.select(this).select("text")[0][0].__data__.uri;
        var tmp = uri.split('http://dbpedia.org/resource/');
        var desc = '';
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=1&QueryString="+tmp[1],
            async:false
        }).done(function( data ) {
            //console.log(data)
            desc = data.results[0].description
        });
        if(!desc){
            desc='';
        }
        $(d3.select(this).select("circle")).popover({
            'title': '<b>'+n_value+'</b>',
            'html':true,
            'content': '<a href="'+uri+'">'+uri+'</a><div style="text-align:justify">'+desc+'</div>',
            'container':'body'
        }).popover("show");

        $('.recent .r_entity').mouseover(function(){
            $(this).css('background-color','orange');
            var id=convertToSlug($(this).text());
            d3.select("#bubblecloud svg").selectAll('#t_'+id).attr('opacity',0.9);
        }).mouseout(function(){
            $(this).css('background-color','');
            var id=convertToSlug($(this).text());
            d3.select("#bubblecloud svg").selectAll('#t_'+id).attr('opacity',0);
        });
    };

    this.mouseout = function() {
        if(! d3.select(this).classed('node-selected')){
            d3.select(this).select("circle")
                .style("stroke-width", 1);
            d3.select(tdhis).select("text").attr("opacity", 0);
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
                .attr("opacity", 0.9);
            d3.select(this).classed('node-selected',true);
        }else{
            d3.select(this).classed('node-selected',false);
            d3.select(this).select("text").attr("opacity", 0);
        }

    };

    this.tick = function(e) {
        /*        node.attr("transform", function(d) { return "translate(" + d.x  + "," + d.y+ ")"; }); */
        var k = .1 * e.alpha;
        var _this = this;

        // Push nodes toward their designated focus.
        this.nodes.forEach(function(o, i) {
            o.y += (_this.foci_category(o.category).y - o.y) * k;
            o.x += (_this.foci_category(o.category).x - o.x) * k;
        });

        this.node.select('circle')
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        this.node.select('text')
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    };

   this.restart =  function () {
        var node = this.node.data(this.nodes);

        var nn = node.enter().insert('g').attr("class", "node")
            .on("mouseover", this.mouseover)
            .on("mouseout", this.mouseout)
            .on("mousedown", this.mousedown)
            .call(this.force.drag);
        var c_added = nn.append("circle")
            .attr("id",function(d){return d.slug_text;})
            .attr("class", "node-circle")
            .attr("r", 1)
            .style("stroke","#999490")
            .style("stroke-width","1")
            .style("fill",function(d){return color(d.category)})
            .transition()
            .duration(500)
            .style("opacity",function(d){return opacScale(d.proportion)})
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

        this.force.start();
    };

    rScale = d3.scale.log ()
        .domain([1, 1000])
        .range([12, 80]);

    opacScale = d3.scale.log()
        .domain([0, 1])
        .range([0.25, 1]);
}