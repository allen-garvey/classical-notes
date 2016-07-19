"use strict";
//requires
var config = require(__dirname + '/config.js');
var express = require('express');
var models = require(__dirname + '/models/models.js');
//set handlebars file extension to .hbs and set default layout to main
var handlebars = require('express-handlebars').create({defaultLayout:'main', extname: '.hbs'});
var bodyParser = require('body-parser');

//setup app
var app = express();
//use public dir for static files
app.use(express.static('public'));

//setup app views
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

//setup body parser for post bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set port
app.set('port', config.port);


//routes
app.get('/', function(req,res){
	var context = config.getDefaultContext();
	context.header = {headerTitle: config.siteTitle, headerText: config.siteDescription};
	res.render('home', context);
});

//resource routes for models
for(let key in models){
	let model = models[key];
	//index routes
	app.get('/'+model.url, function(req,res){
		var context = config.getDefaultContext();
		context.header = {headerTitle: model.display, headerText: model.description};
		context.model = model;
		res.render('index', context);
	});
	//new routes
	app.get('/'+model.url+'/new', function(req,res){
		var context = config.getDefaultContext();
		context.model = model;
		res.render('new', context);
	});
}


//default route when nothing else matches
app.use(function(req,res){
  var context = {header:{headerTitle: "404", headerText: "Page not found"}};
  res.status(404);
  res.render('404', context);
});


//start app
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});