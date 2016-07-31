"use strict";
var path = require('path');
var environment = require(path.join(__dirname, 'environment.js'));
var models = require(path.join(__dirname, 'models', 'models.js'));

//configuration for app
var config = {};

config.db = require(path.join(__dirname, 'db.js'));

config.port = process.env.PORT || 3000;
if(environment.CURRENT === environment.LOCAL){
	config.baseUrl = 'http://localhost:3000/';
}
else{
	config.baseUrl = 'http://localhost/';
}

config.siteTitle = 'Classical Notes';
config.siteDescription = 'A classical music catalog of composers and their pieces';

config.getDefaultContext = function(){
	var context = {
					baseUrl: config.baseUrl, 
					pageTitle: config.siteTitle, 
					pageDescription: config.siteDescription,
					siteTitle: config.siteTitle
				};
	context.sections = ['composers', 'musicalWorks', 'movements', 'tags'].map(function(section){ return models[section]; });
	return context;
};

module.exports = config;