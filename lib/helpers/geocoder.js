/**
 * Created by Ugochimbo on 5/11/2015.
 */

function GeoCoder() {

    var geocoderProvider = 'google';
    var httpAdapter = 'http';
    var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

    var _this = this;

    this.response = [];

    this.setGeocoderProvider = function(provider) {
        geocoderProvider = provider;
    };

    this.setHttpAdapter = function(adapter) {
        httpAdapter = adapter;
    };

    this.getGeoCode = function (address) {
        geocoder.geocode(address, function(error, response) {
            _this.response = [response[0].latitude, response[0].longitude];
        });
        return _this.response;
    };

    /**
     *
     * @param coordinates Object: lng lat
     */

    this.reverseGeoCode = function (coordinates) {
        geocoder.geocode(coordinates, function(error, response) {
            return {
                error: error,
                response: response
            }
        });
    };

}

module.exports = GeoCoder;