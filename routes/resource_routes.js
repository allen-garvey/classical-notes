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
	//don't iterate over ORMS
	if(key.match(/^[A-Z]/)){
		continue;
	}
	let model = models[key];
	//index routes
	router.get('/'+model.url, function(req,res,next){
		var context = config.getDefaultContext();
		context.header = {headerTitle: model.display, headerText: model.description};
		context.model = model;
		if(req.session.flash){
			context.flash = req.session.flash;
			delete req.session.flash;
		}
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
	router.get('/'+model.url+'/new', function(req,res,next){
		var context = config.getDefaultContext();
		if(req.session.errors){
			context.errors = req.session.errors;
			//delete it from session so errors are only displayed once
			delete req.session.errors;
			context.presetData = req.session.presetData;
			delete req.session.presetData;
		}
		model.getRelatedFields(pool, function(err, relatedFields){
			if(err){
				next(err);
				return;
			}
			context.model = model;
			//add items as a list of items on field
			relatedFields.forEach(function(field){
				var modelField = context.model.fields.find(function(item){return item.model === field.name;});
				modelField.items = field.items;
			});
			res.render('create-edit-form', context);
		});
	});
	//routes for forms to edit models
	router.get('/'+model.url+'/:id/edit', function(req,res,next){
		var context = config.getDefaultContext();
		if(req.session.errors){
			context.errors = req.session.errors;
			//delete it from session so errors are only displayed once
			delete req.session.errors;
		}
		//retrieve model that is going to be update so we can pre-populate
		//form inputs 
		pool.query(model.getQuery, [req.params.id], function(savedModelErr, savedModel){
			if(savedModelErr){
				next(savedModelErr);
				return;
			}
			//no models found matching id
			if(savedModel.length === 0){
				next();
				return;
			}
			context.presetData = savedModel[0];
			context.presetData.id = req.params.id;
			model.getRelatedFields(pool, function(err, relatedFields){
				if(err){
					next(err);
					return;
				}
				context.model = model;
				//add items as a list of items on field
				relatedFields.forEach(function(field){
					var modelField = context.model.fields.find(function(item){return item.model === field.name;});
					modelField.items = field.items;
					//preselect items in dropdowns
					var preselectedItem = modelField.items.find(function(item){return item.id === context.presetData[modelField.name]; });
					if(preselectedItem){
						preselectedItem.preselected = true;
					}
				});
				res.render('create-edit-form', context);
			});
		});
	});
	//create new model route
	router.post('/'+model.url, function(req,res,next){
		var modelData = model.cleanRequest(req.body);
		//returns false if there is error in request
		if(!modelData){
			//errors, so redirect to form so they can try again
			req.session.errors = ['Some required fields were missing'];
			req.session.presetData = req.body;
			res.redirect('/'+model.url+'/new');
			return;
		}
		console.log(model.insertQuery);
		pool.query(model.insertQuery, modelData,
			function(err, result){
				//problem saving in the database
				if(err){
					//clean up db generated error message
					var error_message = err.message.replace(/^\w*:\s?/i, '');
					req.session.errors = [error_message];
					req.session.presetData = req.body;
					res.redirect('/'+model.url+'/new');
					return;
				}
				var newItem = new models[model.orm](req.body);
				req.session.flash = {message: newItem.toString() + ' created'};
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
		console.log(context.model.getQueryWithRelated());
		pool.query(context.model.getQueryWithRelated(), [id], function(err, rows, fields){
	    	if(err){
	     		next(err);
	      		return;
			}
			if(rows.length === 0){
				next();
				return;
			}	
			var orm = models[model.orm];
			context.item = new orm(rows);
			context.item.id = id;
	    	context.partialPath = function(){ return model.dbTable + '/show';}
			res.render('show', context);
		});

		
	});

	//update and delete an individual model routes
	router.post('/'+model.url+'/:id', function(req,res,next){
		if(!req.body.method || !req.body.method.match(/^(DELETE|PATCH)$/i)){
			return next();
		}
		var id = parseInt(req.params.id);
		//make sure id is number
		if(isNaN(id)){
			return next();
		}
		var context = config.getDefaultContext();
		context.model = model;
		//delete action
		if(req.body.method.toUpperCase() == 'DELETE'){
			//combine get and delete so that we can get item's string representation
			//for flash message before deleting it
			var getAndDeleteQuery = context.model.getQuery + ';' + context.model.deleteQuery;
			console.log(getAndDeleteQuery);
			pool.query(getAndDeleteQuery, [id, id], function(err, results){
				if(err){
					return next(err);
				}
				//check to see if item exists
				if(results.length != 2 || results[0].length === 0){
					return next();
				}
				//add deleted item name to session so we can display flash
				//message that it was deleted
				var newItem = new models[model.orm](results[0][0]);
				req.session.flash = {message: newItem.toString() + ' deleted'};

				return res.redirect('/'+model.url);
			});
		}
		//update action
		else{
			var modelData = context.model.cleanRequest(req.body);
			//create item so we can use string representation for flash messages
			var item = context.model.ormFromCleanedRequest(modelData);
			
			//returns false if there is error in request
			if(!modelData){
				//errors, so redirect to form so they can try again
				req.session.errors = ['Some required fields were missing'];
				req.session.presetData = req.body;
				return res.redirect('/'+model.url+'/' + id + '/edit');
			}
			console.log(context.model.updateQuery);
			modelData.push(id);
			pool.query(context.model.updateQuery, modelData, function(err, results){
				//problem saving in the database
				if(err){
					//clean up db generated error message
					var error_message = err.message.replace(/^\w*:\s?/i, '');
					req.session.errors = [error_message];
					req.session.presetData = req.body;
					res.redirect('/'+model.url+'/' + id + '/edit');
					return;
				}
				//item with that id doesn't exist in database
				if(results.affectedRows < 1){
					return next();
				}
				req.session.flash = {message: item.toString() + ' updated'};
				return res.redirect('/'+model.url);
			});
		}

	});
}

module.exports = router;

