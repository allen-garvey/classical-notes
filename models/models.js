"use strict";

var models = {};

function Model(data){
	for(var key in data){
		this[key] = data[key];
	}
	this.plural = this.plural || (this.singular + 's');
	this.url = this.plural.replace(/\s/g, '-');
	this.dbTable = this.plural.toLowerCase().replace(/\s/g, '_');
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
					display: 'Date of birth'
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
					name: 'order',
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