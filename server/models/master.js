'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var masterSchema = new Schema({
  password : String,
  online   : Boolean
});

module.exports = mongoose.model('Master', masterSchema);
