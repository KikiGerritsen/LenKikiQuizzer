// TODO: have to find out how to get the username from the prompt

app.controller('playerController', function($scope) {
  var socket = io();
  $scope.state = {
    setTeamname : true,
    gotoQuiz    : false,
    pendingforquestion : false,
    question : false
  };
  $scope.alert = '';
  $scope.teamname = '';
  $scope.quiz = '';
  $scope.question = '';

  if($scope.alert !== ''){
    $scope.state.alert = true;
  } else {
    $scope.state.alert = false;
  }

  $scope.title="PLAYER"
  socket.on('connect', function(){
    console.log("connection established:", $scope.title);
    socket.emit("adduser", {type:$scope.title});
  });

  socket.on('broadcast', function(data){
    console.log("broadcast",data);
  });

  socket.on('quiz:started', function(data){
    console.log("quiz:started", data);
    for(var i = 0; i < data.players.length; i++){
      console.log("looping through players");
      if(data.players[i].teamname === $scope.teamname){
        console.log("match", data.players[i].teamname);
        $scope.quiz = data.password;
        console.log("inside");
        $scope.state.gotoQuiz = false;
        $scope.state.setTeamname = false;
        $scope.state.pendingforquestion = true;
        $scope.$apply();
        socket.emit('switchRoom', {type:$scope.teamname, quiz:data.password});
        break;
      } else {
        console.log('not in array', data.players[i].teamname);
        console.log("not inside");
        $scope.state.gotoQuiz = false;
        $scope.state.setTeamname = true;
        $scope.$apply();
        socket.emit('switchRoom', {type:$scope.teamname, quiz:'Lobby'});
      }
    }
  });

  socket.on('All:inquiz', function(data){
    console.log('All:inquiz', data);
  });

  socket.on('question:asked', function(data){
    console.log(data);
    $scope.state.question = true;
    $scope.state.pendingforquestion = false;
    $scope.question = data.question;
    $scope.$apply();
  });

  $scope.playerAnswered = function(data){
    $scope.alert = "";
    console.log('answe:',data);
    if(data === undefined || data === ""){
      $scope.alert = "Answer cannot be empty";
    } else {
      socket.emit('player:answered', {quiz:$scope.quiz, answer:data, team:$scope.teamname, correctAnswer:false});
    }
  }

  socket.on('master:endedQuestion', function(data){
    console.log('master:endedQuestion', data);
    $scope.state.question = false;
    $scope.state.pendingforquestion = true;
    $scope.$apply();
  });

  socket.on('round:next', function(data){
    console.log('round:next', data);
  });

  $scope.setATeamname = function(teamname){
    $scope.teamname = teamname;
    $scope.state.gotoQuiz = true;
    $scope.state.setTeamname = false;
  }
  $scope.applyForQuiz = function(quiz){
    socket.emit('player:add', {team:$scope.teamname, quiz:quiz});
  }
});
