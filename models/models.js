"use strict";

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
}

Model.prototype.dbFields = function(){
	return this.fields.map(function(field){ return field.name;});
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
		if(rawData === undefined){
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


module.exports = models;