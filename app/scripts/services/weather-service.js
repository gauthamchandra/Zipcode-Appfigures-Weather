'use strict';

weatherModule.factory('WeatherService', ['$http', '$q', function($http, $q) {

    /**
     * Small Utlity function to convert from Celsius to Fahrenheit
     * */
    function convertFromCelsiusToFahrenheit(temperature) {
        return ((temperature * 1.8) + 32).toFixed(2);
    }

    return {
        /**
         * Grabs the current temperature from the AppFigures w/s and returns it to the user in the specified format
         *
         * @param {number} zipCode - the current zipcode of the location we are trying to get the temperatures for
         * @param {string} tempMeasurementType - this usually equates to either a 'F' for Fahrenheit or 'C' for Celsius
         *
         * TODO: Temperature returned is from a random number generator. Change that to return actual temperatures
         *
         * @returns temperature - in the format specified
         * */
        getWeatherFromZipCode: function(zipCode) {
            var deferred = $q.defer();

            $http.get('http://weather.appfigures.com/weather/' + zipCode)
                .success(function(data) {
                    //make sure the webservice returned it in the appropriate format
                    if (data && typeof(data.temperature) !== 'undefined') {

                        //return back an object that contains both the zipcode and the temperature
                        //note the cutting of precision to 2 numbers.
                        //need to do this to prevent rounding errors in precision number arithmetic causing a lot of
                        //trailing zeroes (google (0.1 + 0.2))
                        deferred.resolve(
                            {
                                'zipcode': zipCode,
                                'temperatureInCelsius': data.temperature + 'C',
                                'temperatureInFahrenheit': convertFromCelsiusToFahrenheit(data.temperature) + 'F',
                                'measurementType': 'Fahrenheit'
                            });
                    }
                    //otherwise throw an error message
                    else {
                        deferred.reject('Something went wrong when trying to grab the weather: The format of ' +
                            'the data is not what it should be');
                    }

                }).error(function(data, status) {
                    //since AppFigures isn't really telling us what the error response format is,
                    //just take a wild guess
                    var errorMessage = 'Something went wrong when trying to grab the weather.';
                    if (data && data.message) {
                        deferred.reject(errorMessage + ' Error: ' + data.message);
                    }
                    //if its not in data.message, just give back the generic error message with a status
                    else {
                        deferred.reject(errorMessage + ' Status Code: ' + status.number);
                    }
                });

            return deferred.promise;
        }
    };
}]);