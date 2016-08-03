"use strict";
var path = require('path');
var config = require(path.join(__dirname, 'config.js'));
var express = require('express');

//setup app
var app = express();

//use public dir for static files
app.use(express.static('public'));

//setup app views
var handlebars = require('express-handlebars').create({defaultLayout:'main', extname: '.hbs'});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

//setup body parser for post bodies
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//setup sessions
var session = require('express-session');
app.use(session({ secret: config.sessionSecret, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

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