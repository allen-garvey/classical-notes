"use strict";
var async = require('async');

var models = {};

//function for abstract model data definition
function Model(data){
	for(var key in data){
		this[key] = data[key];
	}
	this.plural = this.plural || (this.singular + 's');
	this.url = this.plural.replace(/\s/g, '-');
	this.dbTable = this.plural.toLowerCase().replace(/\s/g, '_');
	this.orm = this.singular.split(/\s/).map(function(str){return str.charAt(0).toUpperCase() + str.slice(1);}).join('');
	this.deleteQuery = 'DELETE FROM ' + this.dbTable + ' WHERE id = ?';
	this.getAllQuery = 'SELECT id,' + this.dbFields().join(',') + ' FROM ' + this.dbTable;
	this.getQuery = this.getAllQuery + ' WHERE id = ?';
	this.updateQuery = 'UPDATE ' + this.dbTable + ' SET ' + this.dbFields().map(function(field){return field+'=?';}).join(',') + ' WHERE id=?';
	var insertFieldPlaceholders = this.fields.map(function(){ return '?'; }).join(',');
	var fieldNames = this.fields.map(function(field){return field.name;}).join(',');
	this.insertQuery = 'INSERT INTO ' + this.dbTable + ' (' + fieldNames + ') VALUES (' + insertFieldPlaceholders + ')';
	var updateFieldPlaceholders = this.fields.map(function(field){return field.name + '= ?';}).join(',');
	this.updateQuery = 'UPDATE ' + this.dbTable + ' SET ' + updateFieldPlaceholders + ' WHERE id=?';
}

//returns an array of the database names of the fields in the model
Model.prototype.dbFields = function(){
	return this.fields.map(function(field){ return field.name;});
};

//returns all related models that required for the drop-downs
//this is identified by the field in the model fields array containing a 'model' property
//on the new and edit form input views in the form [{'name':  'composers','items': [ModelOrms]}]
//pool is the database pool to be used
//doneCallback is called when retrieving all models are done - it is passed an error and array of results
Model.prototype.getRelatedFields = function(pool, doneCallback){
	// if(!this.relatedFields){
	// 	doneCallback(null, []);
	// 	return;
	// }
	async.map(this.fields.filter(function(field){return field.model;}), function(item, done){
		var model = models[item.model];
		pool.query(model.getAllQuery, function(err, rows, fields){
	    	if(err){
	     		done(err, null);
	      		return;
			}
			var orm = models[model.orm];
			var items = rows.map(function(raw_item){return new orm(raw_item);});
			var ret = {name: item.model, items: items};
	    	done(null, ret);
	    	return;
		});
	}, doneCallback);
};


//takes request body and prepares to be inserted/updated
//into database
//returns array of data to be inserted or false
//if required fields are missing
Model.prototype.cleanRequest = function(requestBody){
	var ret = [];
	var fields = this.fields;
	for(var i = 0; i < fields.length; i++){
		var field = fields[i];
		var rawData = requestBody[field.name];
		//check if field is not given
		if(rawData === undefined || rawData === ''){
			if(!field.non_required){
				return false;
			}
			//empty field is not required,
			//so convert to null for database
			rawData = null;
		}
		ret.push(rawData);
	}
	return ret;
};

//takes array from cleanRequest and turns it into orm instance
Model.prototype.ormFromCleanedRequest = function(cleanedRequest){
	var fields = this.fields;
	var data = {};
	for(var i = 0; i < fields.length; i++){
		var field = fields[i];
		data[field.name] = cleanedRequest[i];
	}
	return new models[this.orm](data);
};

//ORM function for concrete item
models.Composer = function(data){
	for(var key in data){
		this[key] = data[key];
	}
}
models.Composer.prototype.toString = function(){
	return this.first_name + ' ' + this.last_name;
}

models.MusicalWork = function(data){
	for(var key in data){
		this[key] = data[key];
	}
}
models.MusicalWork.prototype.toString = function(){
	return this.title;
}

models.Movement = function(data){
	for(var key in data){
		this[key] = data[key];
	}
}
models.Movement.prototype.toString = function(){
	return this.title;
}

models.Tag = function(data){
	for(var key in data){
		this[key] = data[key];
	}
}
models.Tag.prototype.toString = function(){
	return this.content;
}

models.MovementsTag = function(data){
	for(var key in data){
		this[key] = data[key];
	}
}
models.MovementsTag.prototype.toString = function(){
	return this.movement_id + ' ' + this.tag_id;
}


models.composers = new Model({
	display : 'Composers',
	singular : 'composer',
	description : 'A musical creator of pieces',
	fields : [
				{
					name: 'first_name',
					type: 'text',
					display: 'First Name'
				},
				{
					name: 'last_name',
					type: 'text',
					display: 'Last Name'
				},
				{
					name: 'dob',
					type: 'date',
					display: 'Date of birth',
					non_required: true
				}
			  ]
});

models.musicalWorks = new Model({
	display : 'Musical Works',
	singular : 'musical work',
	description: 'A group of movements, created by a composer',
	fields : [
				{
					name: 'title',
					type: 'text',
					display: 'Title'
				},
				{
					name: 'composer_id',
					model: 'composers',
					display: 'Composer'
				}
			  ]
});

models.movements = new Model({
	display : 'Movements',
	singular : 'movement',
	description: 'A complete musical thought',
	fields : [
				{
					name: 'title',
					type: 'text',
					display: 'Title'
				},
				{
					name: 'order_num',
					type: 'number',
					display: 'Order in movement'
				},
				{
					name: 'musical_work_id',
					model: 'musicalWorks',
					display: 'Parent Work'
				}
			  ]
});

models.tags = new Model({
	display : 'Tags',
	singular : 'tag',
	description : 'Short descriptions that can be added to movements',
	fields : [
				{
					name: 'content',
					type: 'text',
					display: 'Content'
				}
			  ]
});

models.movementsTags = new Model({
	display : 'Movements Tags',
	singular : 'movements tag',
	description : 'Tags that have been added to movements',
	fields : [
				{
					name: 'movement_id',
					model: 'movements',
					display: 'Movements'
				},
				{
					name: 'tag_id',
					model: 'tags',
					display: 'Tags'
				}
			  ]
});






module.exports = models;