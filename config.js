"use strict";
var path = require('path');
var models = require(path.join(__dirname, 'models', 'models.js'));

//configuration for app
var config = {};

config.db = require(path.join(__dirname, 'config', 'db.js'));
config.port = process.env.PORT || 3000;

config.sessionSecret = 'The session secret';

/*
* Views Configuration
*/
//used for links to resources in html
config.baseUrl = '/';

//title and description used for templates
config.siteTitle = 'Classical Notes';
config.siteDescription = 'A classical music catalog of composers and their pieces';

//used for rendering templates
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