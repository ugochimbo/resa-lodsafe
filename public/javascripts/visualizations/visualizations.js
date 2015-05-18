
/************************** Visualizations  Factory **************************/

function Visualizations() {

    this.svg = null;
    this.width = 900;
    this.height = 900;

    this.getResourceDescription = function(resource){
        var desc='';
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://lookup.dbpedia.org/api/search/PrefixSearch?MaxHits=1&QueryString="+resource,
            async:false
        }).done(function( data ) {
            //console.log(data)
            desc=data.results[0].description
        });

        return desc;
    }

}

Visualizations.prototype = {
    initVisualization: function(data) {},   
    updateVisualization: function (data) {},
    remove: function() {}
};