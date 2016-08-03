//Routes for resources:
//Index (view all), show (view single), create, update and delete
'use strict';

var path = require('path');
var config = require(path.join(__dirname, '..', 'config.js'));
var express = require('express');
var router = express.Router();

var models = require(path.join(__dirname, '..', 'models', 'models.js'));

//setup database connection
var mysql = require('mysql');
var pool = mysql.createPool(config.db);


//resource routes for models
for(let key in models){
	let model = models[key];
	//index routes
	router.get('/'+model.url, function(req,res,next){
		var context = config.getDefaultContext();
		context.header = {headerTitle: model.display, headerText: model.description};
		context.model = model;
		console.log(context.model.getAllQuery);
		pool.query(context.model.getAllQuery, function(err, rows, fields){
	    	if(err){
	     		next(err);
	      		return;
			}
			var orm = models[model.orm];
			context.items = rows.map(function(raw_item){return new orm(raw_item);});
	    	res.render('index', context);
		});
		
	});
	//routes for forms to create new models
	router.get('/'+model.url+'/new', function(req,res){
		if(req.error){
			console.log('Request contains error');
		}
		var context = config.getDefaultContext();
		context.model = model;
		res.render('new', context);
	});
	//create new model route
	router.post('/'+model.url, function(req,res,next){
		var modelData = model.cleanRequest(req.body);
		//returns false if there is error in request
		if(!modelData){
			//errors, so redirect to form so they can try again
			res.redirect('/'+model.url+'/new');
			return;
		}
		pool.query(model.insertQuery, modelData,
			function(err, result){
				//problem saving in the database
				if(err){
					//err.message contains message
					//TODO attach error to req somehow
					//along with previously submitted data
					console.log(err);
					res.redirect('/'+model.url+'/new');
					return;
				}
				//redirect to index
				res.redirect('/'+model.url);
		});
	});
	//show routes for individual items
	router.get('/'+model.url+'/:id', function(req,res,next){
		var id = parseInt(req.params.id);
		//make sure id is number
		if(isNaN(id)){
			next();
			return;
		}
		var context = config.getDefaultContext();
		context.model = model;
		
		pool.query(context.model.getQuery, [id], function(err, rows, fields){
	    	if(err){
	     		next(err);
	      		return;
			}
			if(rows.length === 0){
				next();
				return;
			}	
			var orm = models[model.orm];
			context.item = new orm(rows[0]);
	    	context.partialPath = function(){ return model.dbTable + '/show';}
			res.render('show', context);
		});

		
	});

	//update and delete an individual model routes
	router.post('/'+model.url+'/:id', function(req,res,next){
		if(!req.body.method || !req.body.method.match(/^(DELETE|PATCH)$/i)){
			next();
			return;
		}
		var id = parseInt(req.params.id);
		//make sure id is number
		if(isNaN(id)){
			next();
			return;
		}
		var context = config.getDefaultContext();
		context.model = model;
		context.item = query.get(context.model, id);
		if(!context.item){
			next();
			return;
		}
		//delete action
		if(req.body.method.toUpperCase() == 'DELETE'){
			console.log(context.model.deleteQuery);
			pool.query(context.model.deleteQuery, [id],
				function(err, result){
					if(err){
						next(err);
						return;
					}
					//redirect to index
					res.redirect('/'+model.url);
			});
		}
		//update action
		else{
			next();
			return;
		}

	});
}

module.exports = router;
