# Classical Notes

A web application that lets you create, edit update and delete information about classical composers and their musical works.

## Dependencies

* Node 4.2.6 (or later)
* Boostrap 3
* jQuery (used for Bootstraps mobile hamburger menu)
* MySql (latest version)

## Getting Started (local development)

* Install MySql and start the MySql server
* In `config/db.js` in the project folder, enter the credentials for the database connection
* Run the queries contained in `migrations/create_tables.sql` in MySql to initialize the database tables
* `cd` to root of project
* Type `npm install` to install dependencies
* Type `npm start` to start server
* Navigate your browser to `http://localhost:3000`

## Deploying using Amazon Elastic Beanstalk (as of 2016)

* Sign into AWS console and create a new Node.js Elastic Beanstalk app
* Attach an RDS instance to it using MySql engine
* Connect to the RDS instance using a MySql client and run the queries contained in `migrations/create_tables.sql`
* Create a zip file of this project (minus the node_modules directory, migrations directory, any hidden files and the license and README files)
* Upload this zip file as the source code of your Elastic Beanstalk application
* Navigate to your browser to your Elastic Beanstalk app's url

## License

Classical Notes is released under the MIT License. See license.txt for more details.