'use strict';

weatherModule.controller('MainWeatherController',
    function ($scope, LocationService, WeatherService) {
        //a flag used to check if the weather w/s call operations are being called
        $scope.isAlreadyRunningWS = false;

        /**
         * A mini class of sorts to hold the data being deposited in the table of results
         * */
        function WeatherResult(data) {
            var self = this;
            self.zipcode = data.zipcode;
            self.temperatureInCelsius = data.temperatureInCelsius;
            self.temperatureInFahrenheit = data.temperatureInFahrenheit;
            self.measurementType = data.measurementType;
        }

        /**
         * SEAF that initializes any model variables as well as UI elements like tooltips, loading windows, etc.
         * */
        function init() {
            $('[data-toggle="tooltip"]').tooltip({ container: 'body'});

            //put up a loading window and set the appropriate variables
            $scope.modal = {};
            $scope.modal.title = '';
            $scope.modal.description = '';

            //initialize the modal dialog and have it lying in wait
            //also make sure that whenever it closes, the element it is focusing on is the text input
            $('#loading-window').modal({
                keyboard: false,
                show: false
            }).on('hidden.bs.modal', function() {
                $('#zipcode-text').focus();
            });

            $scope.weatherResults = [];

            //create a stub for it now in case the user clicks geolocation button
            $scope.data = {
                zipcode: ''
            };

            //initialize the boolean flag used by ngshow
            $scope.showValuesInFahrenheit();
        }

        /**
         * Displays an error message using a Bootstrap dialog
         * @param {string} title
         * @param {string} description
         * */
        function displayErrorMessage(title, description) {
            $scope.errorExists = true;
            $scope.error = {};
            $scope.error.title = title;
            $scope.error.description = description;
        }

        /**
         * Gets the weather data from the AppFigures webservice
         * */
        function getWeatherData() {

            //============================
            //Callback Functions for W/S
            //============================
            function getWeatherFromZipCodeSuccess(data) {
                $scope.unsortedWeatherResults.push(new WeatherResult(data));
                $scope.requestCount++;
            }

            function getWeatherFromZipCodeError(data) {
                displayErrorMessage('Error', data);
                $scope.requestCount++;
            }

            //the finally callback
            function afterGetWeatherFromZipCode() {
                if ($scope.requestCount === $scope.totalRequests) {

                    //now that we have all of the requests, lets reorder them in the order that
                    //it was originally requested. This is more efficient for large data-sets
                    //than waiting for each request before proceeding with the next one (essentially
                    //crippling the power of async requests)
                    var tempArr = [];
                    var i = 0, j = 0;

                    while (i < $scope.requestedZipCodes.length) {
                        if ($scope.requestedZipCodes[i] === $scope.unsortedWeatherResults[j].zipcode) {
                            tempArr.push($scope.unsortedWeatherResults[j]);
                            i++;
                            j = 0;
                        }
                        else if (j < $scope.unsortedWeatherResults.length){
                            j++;
                        }
                        //its possibe that one of the requested zipcodes might have errored out
                        //and the results don't contain that zipcode, in that case, just skip
                        else {
                            i++; j = 0;
                        }
                    }

                    //now make the tempArr, the actual weather results
                    $scope.weatherResults = tempArr;

                    $('#loading-window').modal('hide');

                    //the modal window doesn't show/hide immediately so give it a 500ms wait
                    //it also reduces spam enter requests.
                    window.setTimeout(function() {
                        $scope.isAlreadyRunningWS = false;
                    }, 500);

                }
            }

            //make sure a w/s operation isn't already running
            if (!$scope.isAlreadyRunningWS) {
                $scope.isAlreadyRunningWS = true;

                $scope.modal.title = 'Grabbing Weather Data';
                $scope.modal.description = 'Retrieving weather data for the specified zipcode(s)';

                //depending on how this function is called, there might not be a modal window to display loading screens
                if ($('#loading-window').css('display') === 'none') {
                    $('#loading-window').modal('show');
                }

                //split up the arrays and validate the zipcodes
                //could just use a split + join instead of the replace but we won't since only Chrome is 20% faster in
                //that and all other browsers including FF, IE and Safari are much slower
                var untestedZipCodes = $scope.data.zipcode.trim().replace(new RegExp(' ', 'g'), ',').split(',');
                var testedZipCodes = [];
                var invalidZipCodes = [];
                for (var i = 0; i < untestedZipCodes.length; i++) {
                    var trimmedZipCodeString = untestedZipCodes[i].trim();

                    //if when splitting the string created empty entries, just ignore them
                    if(trimmedZipCodeString.length === 0) {
                        continue;
                    }

                    //fastest way to convert to number is Math.floor. If its not a valid number,
                    //it should return NaN
                    var zipcode = Math.floor(trimmedZipCodeString);

                    //add to the invalid zip codes array and then display them at the end
                    //if the zipcode is NaN.
                    //since we need to tell whether the user gave a < 5 digit number or a 5 digit number
                    //that had zeroes stripped from it, we need to check its original string length
                    if (zipcode !== zipcode || trimmedZipCodeString.length !== 5) {
                        invalidZipCodes.push(trimmedZipCodeString);
                    }
                    else {
                        //before we add, Math.floor strips the leading zeros, we need to check the length and re-pad the
                        //zeroes
                        if (zipcode.toString().length < 5) {
                            for (var j = 0; i < j < (5 - zipcode.toString().length); j++) {
                                zipcode = '0' + zipcode;
                            }
                        }

                        testedZipCodes.push(zipcode);
                    }
                }

                //used for reordering the data later
                $scope.requestedZipCodes = testedZipCodes;

                if (invalidZipCodes.length > 0) {
                    displayErrorMessage('Invalid Zipcodes', 'The following are invalid: ' + invalidZipCodes.join(','));
                }

                //first figure out which button is selected: Fahrenheit or Celsius
                var measurementType = 'F';
                if ($('#fahrenheit-btn').hasClass('active')) {
                    measurementType = 'F';
                }
                else {
                    measurementType = 'C';
                }

                //now iterate thru the array and make the necessary w/s calls
                $scope.unsortedWeatherResults = []; //create a temporary array to hold the unsorted results

                //use this to count the number of requests. When it finished all of the requests, we close the modal
                //dialog and reset the isAlreadyRunningWS flag to false.
                $scope.requestCount = 0;
                $scope.totalRequests = testedZipCodes.length;



                for (var k = 0; k < testedZipCodes.length; k++) {
                    WeatherService.getWeatherFromZipCode(testedZipCodes[k]).then(getWeatherFromZipCodeSuccess,
                        getWeatherFromZipCodeError).finally(afterGetWeatherFromZipCode);
                }
            }

        }


        /**
         * The event handler responsible for kicking off the search in the UI when the user hits the Enter key
         * @param Event object
         * */
        $scope.executeSearch = function($event) {
            //only enter kicks off the search

            if ($event.keyCode === 13) {
                getWeatherData();
            }
        };

        /**
         * Grabs geolocation by using the Geolocation
         * service
         * */
        $scope.getZipCodeWithGeolocation = function() {

            //put up a loading window
            $scope.modal = {};
            $scope.modal.title = 'Grabbing Geolocation';
            $scope.modal.description = 'Please wait while we try to figure out where you are...';

            $('#loading-window').modal('show');

            LocationService.getZipcodeFromGeolocation().then(function success(zipcode) {
                //set the zipcode $scope variable and execute search
                $scope.data.zipcode = zipcode;
                getWeatherData();
            }, function failure(errorMessage) {
                displayErrorMessage('', errorMessage);
            }).finally(function afterSuccessOrFailure() {
                    //just in case it might not have closed the modal window, try to close it again
                    $('#loading-window').modal('hide');

            });
        };

        /**
         * Shows the celsius temperature values and hides the Fahrenheit values for the results table
         * */
        $scope.showValuesInCelsius = function() {
            $scope.showCelsiusValues = true;
        };

        /**
         * Shows the Fahrenheit temperature values and hides the Celsius values for the results table
         * */
        $scope.showValuesInFahrenheit = function() {
            $scope.showCelsiusValues = false;
        };


        init();
  });
