"use strict";
//interface for retrieving models from database or mock objects
var models = require(__dirname + '/models.js');
var mock = require(__dirname + '/../mock/models-mock.js');


var query = {};

query.get = function(model, id){
	let items = mock[model.dbTable];
	if(!items){
		return undefined;
	}
	let orm = models[model.orm];
	return new orm(items[id]);

};

query.getAll = function(model){
	let items = mock[model.dbTable];
	if(!items){
		return undefined;
	}
	let orm = models[model.orm];
	let rows = [];
	for(let id in items){
		let item = items[id];
		rows.push(new orm(item));
	}
	return rows;
}


module.exports = query; 