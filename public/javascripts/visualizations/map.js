/**
 * Created by Ugochimbo on 5/1/2015.
 */

function Map() {

    Visualizations.call(this);

    this.map = null;
    this.geocoder = new google.maps.Geocoder();
    this.data = [];

    var _this = this;

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
        console.log(console.log(newData.placefullname));
       // for (var place in newData.placefullname) {
           // console.log(place);
            //plotToMap(getGeoCoordinate(place));
       // }
    };

    var getGeoCoordinate = function(address){
        var interval = setInterval(function() {
        _this.geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                return results;
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
                return false;
            }
          });
        }, 1000);
    };

    var plotToMap = function(geoData){
        if(geoData) {
            _this.map.setCenter(geoData[0].geometry.location);
            var marker = new google.maps.Marker({
                map: _this.map,
                position: geoData[0].geometry.location
            });
        }
    }

}

var map = new Map();