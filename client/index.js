var app = angular.module('quizzerApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl : 'home/index.html',
    controller  : 'homeController'
  })

  .when('/master', {
    templateUrl : 'master/index.html',
    controller  : 'masterController'
  })

  .when('/player', {
    templateUrl : 'player/index.html',
    controller  : 'playerController'
  })

  .when('/board', {
    templateUrl : 'board/index.html',
    controller  : 'boardController'
  });
});
