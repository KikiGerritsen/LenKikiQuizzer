
app.controller('homeController', function($scope) {
  $scope.title = 'HOME';
  $scope.goHome = function(){
    console.log("going home");
  };
  
//   $scope.socket = io();
//   $scope.socket.emit('chat message', 'all cients say hi server :D');
//
//   $scope.socket.on('returnmessage', function(data){
//     console.log(data);
//   });
//
//   $scope.goToMaster = function(){
//     $scope.socket.on('gotoRoom:Master')
//   };
});
