"use strict";

//elastic beanstalk db configuration
if(process.env.RDS_HOSTNAME){
	var db = {
				host     : process.env.RDS_HOSTNAME,
				user     : process.env.RDS_USERNAME,
				password : process.env.RDS_PASSWORD,
				port     : process.env.RDS_PORT
			};
}
//local db configuration
else{
	var db = {
				host  : 'localhost',
				user  : 'cn_user',
				password: '',
				database: 'classical_notes'
			};
}

module.exports = db;