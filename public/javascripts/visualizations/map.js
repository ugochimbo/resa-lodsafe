/**
 * Created by Ugochimbo on 5/1/2015.
 */

function Map() {

    Visualizations.call(this);

    this.map = null;
    this.data = [];

    this.initMap = function() {

        var mapOptions = {
            center: { lat: -34.397, lng: 150.644},
            zoom: 1
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

        for (var key in newData.countries) {

            var latLng = new google.maps.LatLng(newData.countries[key].coordinates[0][0], newData.countries[key].coordinates[0][1]);

            var marker = new google.maps.Marker({
                position: latLng,
                map: this.map,
                title: newData.countries[key].tweet
            });
        }
    };

}

var map = new Map();