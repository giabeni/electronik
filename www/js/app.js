// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('electronik', ['ionic', 'ngSanitize', 'backand', 'ngCookies']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function ( $stateProvider, $urlRouterProvider, $httpProvider, BackandProvider) {
  //Backand settings
  BackandProvider.setAppName('electronik');
  BackandProvider.setAnonymousToken('f410ec71-f5e5-40f0-b780-13f1f96f5008');
  $httpProvider.interceptors.push(httpInterceptor);
  function httpInterceptor($q, $log, $cookieStore) {
    return {
      request: function(config) {
        config.headers['Authorization'] =
          $cookieStore.get('backand_token');
        return config;
      }
    };
  }


  $stateProvider
    .state('category', {
      url: '/category/{cat}',
      cache: false,
      templateUrl: 'templates/category.html',
      controller: 'CategoryCtrl'
    })
    .state('component', {
      url: '/component/{id}',
      cache: false,
      templateUrl: 'templates/component.html',
      controller: 'ComponentCtrl'
    })
    .state('search', {
      url: '/search',
      templateUrl: 'templates/search.html',
      controller: 'SearchCtrl'
    })
    .state('add', {
      url: '/add',
      templateUrl: 'templates/add.html',
      controller: 'AddCtrl'
    })
    .state('buy', {
      url: '/buy',
      templateUrl: 'templates/buy.html',
      controller: 'BuyCtrl'
    });

  $urlRouterProvider.otherwise('/category/');
});
