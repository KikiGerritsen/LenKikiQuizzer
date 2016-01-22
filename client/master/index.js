// TODO: if master disconnectst, still need to log him out
app.controller('masterController', function($scope) {
  $scope.title = "MASTER";
  var socket = io();
  $scope.state = {
    setQuiz : true,
    waitingTeams : false,
    morethantwoteams : false,
    categories : false,
    morethanthreecats : false
  };
  $scope.willingteams = [];
  $scope.approvedTeams = [];
  $scope.pickedCategories = [];
  $scope.categories = {};

  $scope.alert = " ";

  $scope.currentQuiz = "";

  socket.on('connect', function(){
    console.log("connection established:",$scope.title);
    socket.emit("adduser", {type:$scope.title});
    $scope.$apply();
  });

  socket.on('broadcast', function(data){
    console.log('rabble',data);
  });

  /* Player handler */
  socket.on('master:addThisPlayer', function(data){
    $scope.willingteams.push({team:data.team, approved:false});
    $scope.$apply();
  });

  $scope.stateChanged = function(data){
    $scope.alert = '';
    if(data.approved === true){
      $scope.approvedTeams.push(data);
    } else {
      var index = $scope.approvedTeams.indexOf(data);
      if(index>-1){
        $scope.approvedTeams.splice(index, 1);
      }
    }
    if ($scope.approvedTeams.length > 6){
      $scope.alert = "The quiz can not have more than 6 teams!";
    }
    if ($scope.approvedTeams.length < 2){
      $scope.state.morethantwoteams = false;
    } else {
      $scope.state.morethantwoteams = true;
    }
  }
  /* End player handler */

  /* Category handler */
  socket.on('master:categories', function(data){
    for(var i = 0; i < data.categories.length; i++){
      $scope.categories[i] = {
        category:data.categories[i],
        picked:false
      }
    }
    $scope.$apply();
  });

  $scope.stateCatChanged = function(data){
    $scope.alert = ' ';
    if(!data.picked === true){
      $scope.pickedCategories.push(data);
    } else {
      var index = $scope.pickedCategories.indexOf(data);
      if(index>-1){
        $scope.pickedCategories.splice(index, 1);
      }
    }
    if ($scope.pickedCategories.length > 3){
      $scope.state.morethanthreecats = false;
      $scope.alert = "The quiz can not have more than 3 categories!";
    } else
    if ($scope.pickedCategories.length < 3){
      $scope.state.morethanthreecats = false;
      $scope.alert = "The quiz can not have less than 3 categories!";
    } else {
      $scope.state.morethanthreecats = true;
    }
  }

  $scope.goCategories = function(teams){
    for(var i = 0; i < teams.length; i++){
      if(teams[i].approved === true){
        $scope.approvedTeams.push(teams[i]);
      }
    }
    $scope.state.categories = true;
    $scope.state.waitingTeams = false;
    socket.emit("getCategories", {quiz:$scope.currentQuiz, teams:$scope.approvedTeams});
  }
  /* End Category handler */

  //Making sure master is in right room
  socket.on('quiz:started', function(data){
    console.log("quiz:started", data);
    $scope.currentQuiz = data;
    socket.emit('switchRoom', {type:$scope.title, quiz:data.password});
  });

  // Create a quiz
  $scope.makeQuiz = function(quiz){
    socket.emit("switchRoom", {type:$scope.title, quiz:quiz});
    $scope.currentQuiz = quiz;
    $scope.state.setQuiz = false;
    $scope.state.waitingTeams = true;
  }

  /* In quiz*/
  $scope.goQuiz = function(data){
    console.log("in quiz",data);
    $scope.state.categories = false;
    $scope.state.inQuiz = true;
    socket.emit('quiz:inquiz', $scope.currentQuiz);
  }

  socket.on('All:inquiz', function(data){
    console.log('All:inquiz', data);
    socket.emit('quiz:questions', $scope.pickedCategories);
  });
  /* End In quiz */
  $scope.logout = function(){
    socket.emit('switchRoom', {type:"MASTER", quiz:"Lobby", from:$scope.currentQuiz, reason:"logoutMaster"});
  }
});
