"use strict";

var models = require(__dirname + '/models/models.js');
//configuration for app

var config = {};
config.port = 3000; //port app runs on
config.baseUrl = 'http://localhost:3000/';

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