
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
        console.log("Na wa ooooo: " + facetDiv.is("#lodsafe-facets-content"));
        if (facetDiv.length < 2) {
            facetDiv.append("<div id='lodsafe-facets-content'></div><div id='lodsafe-results'></div>");
        }
    };

    this.updateVisualization = function(newData, params){

        for (var key in newData.countries) {
            data.push(newData.countries[key]);
        }

        $.facetelize(_this.settings);
    };

    this.item_template =
        '<div class="item">' +
        '<p class="tags">' +
        '<% if (obj.city) {  %><%= obj.category %><% } %>' +
        '<% if (obj.country) {  %>, <%= obj.continent %><% } %>' +
        '</p>' +
        '<p class="desc"><%= obj.tweet %></p>' +
        '</div>';

    this.settings = {
        items           : data,
        facets          : {
            'city'     : 'City',
            'country'    : 'Country'
        },
        resultSelector  : '#lodsafe-results',
        facetSelector   : '#lodsafe-facets-content',
        resultTemplate  : this.item_template
    };

}

var lodsafe_facet = new LodsafeFacet();