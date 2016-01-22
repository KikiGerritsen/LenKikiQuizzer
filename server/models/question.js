'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
  question : String,
  answer   : String,
  category : String
});

module.exports = mongoose.model('Question', questionSchema);
