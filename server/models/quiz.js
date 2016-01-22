'use strict';
var mongoose = require('mongoose')
var Player = require('./player').playerSchema;
var Master = require('./master').masterSchema;
var Question = require('./question').questionSchema;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var quizSchema = new Schema({
  password      : String,
  createdAt     : {  type    : Date,
                     expires : 3600,
                     default : Date.now()},
  players       : [Player],
  closed        : {  type: Boolean,
                     default: false},
  // players  : {  type: Schema.Types.ObjectId,
  //               ref: 'Player'},
  master        : {  type: Boolean,
                     default: false},
  doneQuestions : [Question]
});

module.exports = mongoose.model('Quiz', quizSchema);
