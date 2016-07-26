//mock data to be used in place of database
"use strict";

function Composer(first_name, last_name, dob){
	this.first_name = first_name;
	this.last_name = last_name;
	this.dob = dob;
}

function Tag(content){
	this.content = content;
}
function MusicalWork(title){
	this.title = title;
}
function Movement(title, order){
	this.title = title;
	this.order = order;
}


var models = {};

models.composers = {
						'1': new Composer('Ludwig', 'van Beethoven', '1770-03-26'),
						'2': new Composer('Wolfgang', 'Mozart', '1756-12-05'),
						'3': new Composer('Johann', 'Bach', '1685-03-31')
					};

models.musical_works = {
						'1': new MusicalWork('Symphony 5'),
						'2': new MusicalWork('Eine Kleine Nachtmusik'),
						'3': new MusicalWork('Symphony 9'),
						'4': new MusicalWork('Double Violin Concerto')
					};

models.movements = {
						'1': new Movement('Allegro', 1),
						'2': new Movement('Adagio', 2),
						'3': new Movement('Largo', 2),
						'4': new Movement('Vivace', 1),
						'5': new Movement('Menuetto', 3),
						'6': new Movement('Rondo', 4)
					};

models.tags = 		{
						'1': new Tag('happy'),
						'2': new Tag('sad'),
						'3': new Tag('serious'),
						'4': new Tag('slow')
					};
//add item id key as property to individual items
for(let modelName in models){
	var model = models[modelName];
	for(let idNum in model){
		let item = model[idNum];
		item.id = parseInt(idNum);
	}
}				


module.exports = models;