"use strict";
var async = require('async');

var models = {};

//function for abstract model data definition
function Model(data){
	for(var key in data){
		this[key] = data[key];
	}
	this.plural = this.plural || (this.singular + 's');
	this.url = this.plural.toLowerCase().replace(/\s/g, '-');
	this.dbTable = this.plural.toLowerCase().replace(/\s/g, '_');
	//default foreign key name used in other database tables
	this.foreignKeyName = this.singular.replace(/\s/g, '_') + '_id';
	//this.orm is name of ORM function on models
	this.orm = this.singular.split(/\s/).map(function(str){return str.charAt(0).toUpperCase() + str.slice(1);}).join('');
	this.deleteQuery = 'DELETE FROM ' + this.dbTable + ' WHERE id = ?';
	this.getQueryBase = 'SELECT id,' + this.dbFieldsSelect().join(','); 
	this.getAllQuery = this.getQueryBase + ' FROM ' + this.dbTable;
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
	return this.fields.map(function(field){ 
		return field.name;
	});
};

//returns an array of the database names of the fields in the model
//used in select statements - converts date fields to proper format
Model.prototype.dbFieldsSelect = function(){
	var self = this;
	return this.fields.map(function(field){ 
		if(field.type === 'date'){
			return 'DATE_FORMAT(' + self.dbTable + '.' + field.name + ',"%Y-%m-%d") AS ' + field.name;
		}
		return self.dbTable + '.' + field.name;
	});
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
var ORMCreator = function(data, staticClass){
	var fields = staticClass.fields;
	//on LEFT joins multiple rows are returned
	var modelData = Array.isArray(data) ? data[0] : data;
	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
		var fieldName = field.name;
		var fieldValue = modelData[fieldName];
		if(!fieldValue && !field.non_required){
			this.isInvalid = true;
		}
		this[fieldName] = fieldValue;
	}
	if(modelData.id){
		this.id = modelData.id;
	}
	this.url = staticClass.url;
};

//ORM function to add items to ORM object as array - used for has many relationships
var ORMAddMany = function(data, staticClassNameToAdd){
	this[staticClassNameToAdd] = [];
	if(!Array.isArray(data)){
		return;
	}
	var ormConstructor = models[models[staticClassNameToAdd].orm];
	for (var i = 0; i < data.length; i++) {
		var row = data[i];
		var item = new ormConstructor(row);
		if(item.isInvalid){
			continue;
		}
		item.id = row[models[staticClassNameToAdd].foreignKeyName];
		this[staticClassNameToAdd].push(item);
	}
};

//ORM function to add item to ORM object as property - used for has one relationship to original ORM instance
//prefix is optional - it is the prefix added to field names, useful if models share the same
//name for fields, and you select AS with a prefix
var ORMAddOne = function(data, staticClassNameToAdd, prefix){
	prefix = prefix || '';
	var staticClass = models[staticClassNameToAdd];
	var modelData = Array.isArray(data) ? data[0] : data;
	//clean data so original item's data is not still there
	var cleanedData = {};
	for (var i = 0; i < staticClass.fields.length; i++) {
		var field = staticClass.fields[i];
		var modelDataFieldName = prefix + field.name;
		cleanedData[field.name] = modelData[modelDataFieldName];
	}
	cleanedData.id = modelData[staticClass.foreignKeyName];
	var ormConstructor = models[staticClass.orm];
	var item = new ormConstructor(cleanedData);
	if(!item.isInvalid){
		//convert name to singular camel-case
		var name = staticClassNameToAdd.replace(/s$/, '');
		this[name] = item;
	}
};

models.Composer = function(data){
	ORMCreator.call(this, data, models.composers);
	//format dob if there is one
	if(this.dob){
		var dateSplit = this.dob.split('-');
		this.dobFormatted = dateSplit[1] + '/' + dateSplit[2] + '/' + dateSplit[0];
	}
	ORMAddMany.call(this, data, 'musicalWorks');
}

models.Composer.prototype.toString = function(){
	var name = this.first_name;
	if(this.middle_name){
		name = name + ' ' + this.middle_name;
	}
	return name + ' ' + this.last_name;
}

models.MusicalWork = function(data){
	ORMCreator.call(this, data, models.musicalWorks);
	ORMAddOne.call(this, data, 'composers');
}
models.MusicalWork.prototype.toString = function(){
	return this.title;
}

models.Movement = function(data){
	ORMCreator.call(this, data, models.movements);
	ORMAddMany.call(this, data, 'tags');
}
models.Movement.prototype.toString = function(){
	return this.title;
}

models.Tag = function(data){
	ORMCreator.call(this, data, models.tags);
	ORMAddMany.call(this, data, 'movements');
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
					name: 'middle_name',
					type: 'text',
					display: 'Middle Name',
					non_required: true
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
					non_required: true,
					placeholder: 'YYYY-MM-DD'
				}
			  ],
	getQueryWithRelated :	function(){
								var modelTable = this.dbTable;
								return  'SELECT ' +
										this.dbFieldsSelect().join(',') + ',' + 
										models.musicalWorks.dbFieldsSelect().join(',') + 
										',' + models.musicalWorks.dbTable + '.id AS ' + models.musicalWorks.foreignKeyName +
								        ' FROM ' + modelTable +
								        ' LEFT JOIN ' + models.musicalWorks.dbTable + ' ON ' + modelTable + '.id=' + models.musicalWorks.dbTable + '.' + this.foreignKeyName +
								        ' WHERE ' + modelTable + '.id=?';
							}
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
			  ],
	getQueryWithRelated :	function(){
								var modelTable = this.dbTable;
								return  'SELECT ' +
										this.dbFieldsSelect().join(',') + ',' + 
										models.composers.dbFieldsSelect().join(',') + 
										',' + models.composers.dbTable + '.id AS ' + models.composers.foreignKeyName +
								        ' FROM ' + modelTable +
								        ' INNER JOIN ' + models.composers.dbTable + ' ON ' + models.composers.dbTable + '.id=' + modelTable + '.' + models.composers.foreignKeyName +
								        ' WHERE ' + modelTable + '.id=?';
							}
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
			  ],
	getQueryWithRelated :	function(){
								var modelTable = this.dbTable;
								return  'SELECT ' +
										this.dbFieldsSelect().join(',') + ',' + 
										models.tags.dbFieldsSelect().join(',') + 
										',' + models.tags.dbTable + '.id AS ' + models.tags.foreignKeyName +
								        ' FROM ' + modelTable +
								        ' LEFT JOIN ' + models.movementsTags.dbTable + ' ON ' + modelTable + '.id=' + models.movementsTags.dbTable + '.' + this.foreignKeyName +
								        ' LEFT JOIN ' + models.tags.dbTable + ' ON ' + models.movementsTags.dbTable + '.' + models.tags.foreignKeyName + '=' + models.tags.dbTable + '.id ' +
								        ' WHERE ' + modelTable + '.id=?';
							}
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
			  ],
	getQueryWithRelated :	function(){
								var modelTable = this.dbTable;
								return  'SELECT ' +
										this.dbFieldsSelect().join(',') + ',' + 
										models.movements.dbFieldsSelect().join(',') + 
										',' + models.movements.dbTable + '.id AS ' + models.movements.foreignKeyName +
								        ' FROM ' + modelTable +
								        ' LEFT JOIN ' + models.movementsTags.dbTable + ' ON ' + modelTable + '.id=' + models.movementsTags.dbTable + '.' + this.foreignKeyName +
								        ' LEFT JOIN ' + models.movements.dbTable + ' ON ' + models.movementsTags.dbTable + '.' + models.movements.foreignKeyName + '=' + models.movements.dbTable + '.id ' +
								        ' WHERE ' + modelTable + '.id=?';
							}
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
			  ],
	getQueryWithRelated :	function(){
								return this.getQuery;
							}
});






module.exports = models;