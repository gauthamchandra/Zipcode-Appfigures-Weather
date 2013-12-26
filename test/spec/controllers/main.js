'use strict';

describe('Controller: MainWeatherController', function () {

  // load the controller's module
  beforeEach(module('zipcodeAppfiguresWeatherApp'));

  var MainWeatherController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainWeatherController = $controller('MainWeatherController', {
      $scope: scope
    });
  }));

  //stub
  it('Stub task', function() {
      expect('Hello World').toBe('Hello World');
    });


});
