"use strict";

//local db configuration
var local_db = {
				host  : 'localhost',
				user  : 'cn_user',
				password: '',
				database: 'classical_notes'
};

//process.env is for elastic beanstalk db configuration
var db = {
			host     : process.env.RDS_HOSTNAME || local_db.host,
			user     : process.env.RDS_USERNAME || local_db.user,
			password : process.env.RDS_PASSWORD || local_db.password,
			database : local_db.database
};
if(process.env.RDS_PORT){
	db.port = process.env.RDS_PORT;
}


module.exports = db;