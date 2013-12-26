'use strict';

var weatherModule = angular.module('zipcodeAppfiguresWeatherApp', ['ngRoute']);

weatherModule.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainWeatherController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });