"use strict";var weatherModule=angular.module("zipcodeAppfiguresWeatherApp",["ngRoute"]);weatherModule.config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainWeatherController"}).otherwise({redirectTo:"/"})}]),weatherModule.factory("WeatherService",["$http","$q",function(a,b){function c(a){return(1.8*a+32).toFixed(2)}return{getWeatherFromZipCode:function(d){var e=b.defer();return a.get("http://weather.appfigures.com/weather/"+d).success(function(a){a&&"undefined"!=typeof a.temperature?e.resolve({zipcode:d,temperatureInCelsius:a.temperature+"C",temperatureInFahrenheit:c(a.temperature)+"F",measurementType:"Fahrenheit"}):e.reject("Something went wrong when trying to grab the weather: The format of the data is not what it should be")}).error(function(a,b){var c="Something went wrong when trying to grab the weather.";a&&a.message?e.reject(c+" Error: "+a.message):e.reject(c+" Status Code: "+b.number)}),e.promise}}}]),weatherModule.factory("LocationService",["$http","$q",function(a,b){return{getZipcodeFromGeolocation:function(){var c=b.defer();return navigator.geolocation?navigator.geolocation.getCurrentPosition(function(b){b&&b.coords&&b.coords.latitude&&b.coords.longitude?a.get("http://ws.geonames.org/findNearbyPostalCodesJSON?lat="+b.coords.latitude+"&lng="+b.coords.longitude).success(function(a){a&&a.postalCodes&&a.postalCodes.length&&c.resolve(a.postalCodes[0].postalCode)}).error(function(a){c.reject("While calling the Geonames service for looking up the zipcode,the application ran into issues: "+a)}):c.reject("The Geolocation data that came back is incomplete or missing!")},function(a){var b={1:"Permission for Geolocation was denied to the application",2:"Position could not be determined",3:"Request for Geolocation has timed out"};c.reject(b[a.code])},{enableHighAccuracy:!0,timeout:2e4,maximumAge:0}):c.reject("Sorry! Your Browser doesn't support HTML5 Geolocation APIs! Try entering the zipcode manually instead"),c.promise}}}]),weatherModule.controller("MainWeatherController",["$scope","LocationService","WeatherService",function(a,b,c){function d(a){var b=this;b.zipcode=a.zipcode,b.temperatureInCelsius=a.temperatureInCelsius,b.temperatureInFahrenheit=a.temperatureInFahrenheit,b.measurementType=a.measurementType}function e(){$('[data-toggle="tooltip"]').tooltip({container:"body"}),a.modal={},a.modal.title="",a.modal.description="",$("#loading-window").modal({keyboard:!1,show:!1}),a.weatherResults=[],a.data={zipcode:""},a.showValuesInFahrenheit()}function f(b,c){a.errorExists=!0,a.error={},a.error.title=b,a.error.description=c}function g(){function b(b){a.unsortedWeatherResults.push(new d(b)),a.requestCount++}function e(b){f("Error",b),a.requestCount++}function g(){if(a.requestCount===a.totalRequests){for(var b=[],c=0,d=0;c<a.requestedZipCodes.length;)a.requestedZipCodes[c]===a.unsortedWeatherResults[d].zipcode?(b.push(a.unsortedWeatherResults[d]),c++,d=0):d<a.unsortedWeatherResults.length?d++:(c++,d=0);a.weatherResults=b,$("#loading-window").modal("hide"),window.setTimeout(function(){a.isAlreadyRunningWS=!1},500)}}if(!a.isAlreadyRunningWS){a.isAlreadyRunningWS=!0,a.modal.title="Grabbing Weather Data",a.modal.description="Retrieving weather data for the specified zipcode(s)","none"===$("#loading-window").css("display")&&$("#loading-window").modal("show");for(var h=a.data.zipcode.trim().replace(new RegExp(" ","g"),",").split(","),i=[],j=[],k=0;k<h.length;k++){var l=h[k].trim();if(0!==l.length){var m=Math.floor(l);if(m!==m||5!==l.length)j.push(l);else{if(m.toString().length<5)for(var n=0;n>k<5-m.toString().length;n++)m="0"+m;i.push(m)}}}a.requestedZipCodes=i,j.length>0&&f("Invalid Zipcodes","The following are invalid: "+j.join(","));var o="F";o=$("#fahrenheit-btn").hasClass("active")?"F":"C",a.unsortedWeatherResults=[],a.requestCount=0,a.totalRequests=i.length;for(var p=0;p<i.length;p++)c.getWeatherFromZipCode(i[p]).then(b,e,g)}}a.isAlreadyRunningWS=!1,a.executeSearch=function(a){13===a.keyCode&&g()},a.getZipCodeWithGeolocation=function(){a.modal={},a.modal.title="Grabbing Geolocation",a.modal.description="Please wait while we try to figure out where you are...",$("#loading-window").modal("show"),b.getZipcodeFromGeolocation().then(function(b){a.data.zipcode=b,g()},function(a){f("",a)}).finally(function(){$("#loading-window").modal("hide")})},a.showValuesInCelsius=function(){a.showCelsiusValues=!0},a.showValuesInFahrenheit=function(){a.showCelsiusValues=!1},e()}]);