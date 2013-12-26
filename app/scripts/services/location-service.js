'use strict';
weatherModule.factory('LocationService', ['$http', '$q', function($http, $q) {
    return {
        /**
         * Uses HTML5 Geolocation APIs to grab the current coordinates of the user
         * @param successCallback
         * @param failureCallback
         * @returns promise object
         * */
        getZipcodeFromGeolocation : function() {
            var deferred = $q.defer();

            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function success(position) {
                        //now that we have the GPS coordinates, let's use them to get the zipcode
                        if (position && position.coords && position.coords.latitude && position.coords.longitude) {
                            //we will be using Geonames db for this. Their free service will do reverse geocoding
                            //to figure out the zipcodes
                            $http.jsonp('http://api.geonames.org/findNearbyPostalCodesJSON?callback=JSON_CALLBACK&' +
                                    'username=gchandra&lat=' + position.coords.latitude + '&lng=' +
                                    position.coords.longitude)
                                .success(function(data) {
                                    //for now lets just grab the first result. No need to grab every nearby zipcode
                                    if (data && data.postalCodes && data.postalCodes.length) {
                                        deferred.resolve(data.postalCodes[0].postalCode);
                                    }
                                })
                                .error(function(data) {
                                    deferred.reject('While calling the Geonames service for looking up the zipcode,' +
                                        'the application ran into issues: ' + data);
                                });
                        }
                        else {
                            deferred.reject('The Geolocation data that came back is incomplete or missing!');
                        }
                    }, function error(errorObj) {
                        //there are 3 major possible errors:
                        var possibleErrors = {
                            1: 'Permission for Geolocation was denied to the application',
                            2: 'Position could not be determined',
                            3: 'Request for Geolocation has timed out'
                        };
                        deferred.reject(possibleErrors[errorObj.code]);
                    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
            }
            else {
                deferred.reject('Sorry! Your Browser doesn\'t support HTML5 Geolocation APIs!' +
                    ' Try entering the zipcode manually instead');
            }

            return deferred.promise;
        }
    };

}]);