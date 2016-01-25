  // create the controller and inject Angular's $scope
  app.controller('boardController', function($scope) {
  $scope.title = "BOARD";
  $scope.state = {
    setupBoard: true,
    waitforteams: false
  };

  $scope.teams = [];
  $scope.quiz = "";
  $scope.currentQuestion = "";
  $scope.questionNr = 0;
  $scope.teamApplied = "";
  $scope.teamAnswer = "";

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

  socket.on('question:asked', function(data){
    console.log(data);
    $scope.currentQuestion = data.question;
    $scope.questionNr ++;
    if($scope.questionNr === 12){
      socket.emit('question:limitRoundReached');
    }
    $scope.$apply();
  });

  socket.on('player:answeredQuestion', function(data){
    console.log("player:answeredQuestion", data);
    for(var i = 0; i < $scope.teams.length; i++){
      if($scope.teams[i].teamname === data.team){
        console.log("hit", $scope.teams);
        $scope.teams[i].applied = true;
      }
    }
    $scope.$apply();
  });

  socket.on('master:endedQuestion', function(data){
    console.log('master:endedQuestion', data);
    $scope.teams = data.players;
    $scope.$apply();
  });

  $scope.goQuiz = function(quiz){
    $scope.quiz = quiz;
    socket.emit("switchRoom", {type:$scope.title, quiz:quiz});
    $scope.state.waitforteams = true;
    $scope.state.setupBoard = false;
  };
});
