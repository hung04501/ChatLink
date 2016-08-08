

// Load Our Modules

var express = require('express');
var bodyParser = require('body-parser');
//var movies = require('./routes/messages');
var mongoose = require('mongoose');

var app = express();

//connect to our database
//Ideally you will obtain DB details from a config file


var dbName='messageDBtest';

//provide a sensible default for local development
mongodb_connection_string = 'mongodb://192.168.100.113:27017/' + dbName;
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + dbName;
}


mongoose.connect(mongodb_connection_string);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//app.use('/', movies);

module.exports = app;
