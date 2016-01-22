  // create the controller and inject Angular's $scope
  app.controller('boardController', function($scope) {
  $scope.title = "BOARD";
  $scope.state = {
    setupBoard: true,
    waitforteams: false
  };

  $scope.teams = [];
  $scope.quiz = "";

  var socket = io();
  socket.on('connect', function(){
    console.log("connection established",$scope.title);
    socket.emit("adduser", {type:$scope.title});
  });

  socket.on('broadcast', function(data){
    // console.log('broadcast',data);
  });

  socket.on('quiz:started', function(data){
    console.log("quiz:started", data);
    if(data.password === $scope.quiz){
      for(var i = 0; i < data.players.length; i++){
        // console.log(data.players[i]);
        $scope.teams.push(data.players[i]);
        console.log($scope.teams);
        $scope.$apply();
      }
    }
  });

  socket.on('All:inquiz', function(data){
    console.log('All:inquiz', data);
  });

  $scope.goQuiz = function(quiz){
    $scope.quiz = quiz;
    socket.emit("switchRoom", {type:$scope.title, quiz:quiz});
    $scope.state.waitforteams = true;
    $scope.state.setupBoard = false;
  };
});
