var express   = require('express');
var app       = express();
var http      = require('http');
var server    = require('http').createServer(app);
var io        = require('socket.io').listen(server);
var mongoose  = require('mongoose');
var Promise   = require('promise');

var Quiz      = require('./server/models/quiz');
var Player    = require('./server/models/player');
var Question  = require('./server/models/question');

var questions = require('./server/questions.json');

mongoose.connect('mongodb://localhost/quizzer2', function (err) {
  if (err) {
    throw err;
  }
});
app.use(express.static(__dirname + '/client'));
app.get('/', function(req, res){
  console.log(__dirname);
  res.redirect('./index.html');
});

io.sockets.on('connection', function(socket){
  setupQuestions();
  socket.on('adduser', function(data) {
    socket.join('Lobby');
    console.log("user",data,"joined lobby");
    checkQuizzes();
  });

  function checkQuizzes(){
    Quiz.find({master:true}, function(err, quiz){
      if (err) handleError(err);
      else {
        socket.emit('broadcast', {quiz: quiz});
      }
    });
  }

  socket.on('switchRoom', function(data) {
    console.log("switch room", data);
    socket.leave("Lobby");
    socket.join(data.quiz);
    if(data.type === "MASTER"){
      saveQuiz(data);
    }
    if(data.type === "BOARD"){
      getQuizzes(data.quiz);
    }

    socket.broadcast.to('Lobby').emit('broadcast', {
      type: data.type,
      quiz: data.quiz,
      message:'This type has left to this quiz'
    });

    socket.broadcast.to(data.quiz).emit('broadcast', {
      type: data.type,
      quiz: data.quiz,
      message:'This type has joined the '+data.quiz
    });

    console.log(io.nsps['/'].adapter.rooms[data.quiz]);
  });

  socket.on('player:add', function(data){
    console.log('sending master that player wants to be added', data);
    socket.broadcast.to(data.quiz).emit('master:addThisPlayer', data);
  });

  socket.on('getCategories', function(data){
    var teams = [];
    for(var i = 0; i < data.teams.length; i++){
      teams.push(data.teams[i].team);
    }
    createPlayers(teams, data.quiz);
    getAllCategories(data);
  });

  socket.on('quiz:questions', function(data){
    var availableQuestions = [];
    for(var i = 0; i < data.categories.length; i++){
      for(var j = 0; j < questions.length; j++){
        if(data.categories[i].category === questions[j].category){
          availableQuestions.push(questions[j]);
        }
      }
    }
    returnTwelveQuestions(data.quiz.password, availableQuestions);
  });

  var twelveQuestions = [];
  function returnTwelveQuestions(pwd, q){
    var randomQuestion = "";
    if(twelveQuestions.length !== 12){
      for(var i = 0; i < 12; i++){
        randomQuestion = q[Math.floor(Math.random() * q.length)];
        Quiz.findOne({password:pwd}, function(err,quiz){
          if(err)handleError(err);
          else {
            if(quiz.doneQuestions.length === 0){
              randomQuestion = q[Math.floor(Math.random() * q.length)];
              twelveQuestions.push(randomQuestion);
              if(twelveQuestions.length === 12){
                io.sockets.in(pwd).emit('Quiz:twelveQuestions', twelveQuestions);
              }
            } else {
              for(var j = 0; j < quiz.doneQuestions.length; j++){
                randomQuestion = q[Math.floor(Math.random() * q.length)];
                if(quiz.doneQuestions[j] === randomQuestion){
                  console.log("quiz.doneQuestions[j] === randomQuestion", quiz.doneQuestions[j], randomQuestion);
                  i--;
                } else {
                  console.log("Pushing to twelveQuestions");
                  randomQuestion = q[Math.floor(Math.random() * q.length)];
                  twelveQuestions[i].push(randomQuestion);
                }
              }
            }
          }
        });
      }
    }
  }

  socket.on('quiz:inquiz', function(data){
    console.log('quiz:inQuiz', data);
    Quiz.findOne({password:data.password}, function(err, q){
      if(err)handleError(err);
      else {
        q.closed = true;
        q.save(function(err){
          if(err) handleError(err);
          else {
            console.log('quiz is now closed for incoming shit');
            io.sockets.in(data.password).emit('All:inquiz', data);
          }
        });
      }
    });
  });

  socket.on('disconnect', function() {
    console.log('a user disconnected', socket.id);
    socket.leave(socket.room);
  });

  // FIXME: WERKT
  function getAllCategories(){
    Question.find({}, function(err, q){
      if (err) handleError(err);
      else {
        var categories = [];
        for(var i = 0; i < q.length; i++){
          categories.push(q[i].category);
        }
        var uniqueArray = categories.filter(function(elem, pos) {
          return categories.indexOf(elem) == pos;
        });
        socket.emit('master:categories', {categories:uniqueArray});
      }
    });
  }

  // FIXME: WERKT!
  function createPlayers(teams, quiz){
    var uniqueArray = teams.filter(function(elem, pos) {
      return teams.indexOf(elem) == pos;
    });
    console.log("teams",uniqueArray, quiz);
    Quiz.findOne({password:quiz}, function(err, q){
      if(err)handleError(err);
      if(q === null || q === undefined){
        socket.emit('master:alert', {message:"No quiz found"});
      } else {
        for(var i = 0; i < uniqueArray.length; i++){
          var p = new Player();
          p.teamname = uniqueArray[i];
          p.password = quiz;
          q.players.push(p);
          q.save(function(err){
            if(err)handleError(err);
            else{
              console.log("player saved to quiz", q);
              io.sockets.in('Lobby').emit('quiz:started', q);
              io.sockets.in(q.password).emit('quiz:started', q);
            }
          })
        }
      }
    });
  }
});

function getQuizzes(data){
  Quiz.findOne({password:data}, function(err, q){
    if(err)handleError(err);
    else {
      io.sockets.in(q.password).emit('quiz:started', q);
    }
  })
}

// FIXME: Werkt
function handleError(err){
  console.error(err);
}

// FIXME: WERKT
function saveQuiz(data){
  console.log("savinf quiz", data);
  Quiz.findOne({password:data.quiz}, function(err, quiz){
    if(err) handleError(err);
    else {
      if(quiz === null){
        console.log("there are no quizzes",data.quiz);
        var q = new Quiz();
        q.password = data.quiz;
        q.master = true;
        q.save(function(err){
          if(err)handleError(err);
          else {
            console.log(q);
          }
        });
      } else if (quiz.password === data.quiz){
        //message error, quiz already exists
        console.log("quiz already exists",data);
        quiz.master = true;
        quiz.save(function(err){
          if(err)handleError(err);
          else {
            console.log("master is online again");
          }
        });
      }
    }
  });
}

// FIXME: WERKT
function setupQuestions(){
  Question.find({}, function(err, q){
    if(q.length === 0){
      questions.forEach(function (question) {
        var q = new Question();
        q.question = question.question;
        q.answer = question.answer;
        q.category = question.category;
        q.save(function(err){
          if(err) handleError(err);
        });
      });
    }
  });
}

server.listen(3000, function(){
  console.log(__dirname);
  console.log('listening on *:3000');
});
