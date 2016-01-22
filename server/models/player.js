'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var playerSchema = new Schema({
  password : String,
  teamname : String,
  // quiz     : { type: ObjectId,
  //             ref: 'Quiz'},
  score    : { type: Number,
             default : 0},
  // approved : { type: Boolean,
  //            default : false}
  // createdAt: { type: Date,
  //            expires: 3600,
  //            default : Date.now() }
});

module.exports = mongoose.model('Player', playerSchema);
