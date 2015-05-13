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
            center: { lat: -34.397, lng: 150.644},
            zoom: 4
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
        for (var coordinate in newData.geocoordinates) {
            plotToMap(newData.geocoordinates[coordinate]);
        }
    };

    var plotToMap = function(geoData){
        var latLng = new google.maps.LatLng(geoData[0], geoData[1]);

       // _this.map.setCenter(latLng);
        var marker = new google.maps.Marker({
            map: _this.map,
            position: latLng
        });

       // marker.setMap(_this.map);
    };

}

var map = new Map();