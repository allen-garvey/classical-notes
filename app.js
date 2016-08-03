"use strict";
var path = require('path');
var config = require(path.join(__dirname, 'config.js'));
var express = require('express');
// var models = require(path.join(__dirname, 'models', 'models.js'));

//setup database connection
// var mysql = require('mysql');
// var pool = mysql.createPool(config.db);

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

//CRUD routes for resources
let resources_router = require(path.join(__dirname, 'routes', 'resource_routes.js'));
app.use('/', resources_router);


//default route when nothing else matches (404)
app.use(function(req,res){
	var context = config.getDefaultContext();
	context.header = {headerTitle: '404', headerText: 'Page not found'};
	res.status(404);
	res.render('404', context);
});


//start app
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});