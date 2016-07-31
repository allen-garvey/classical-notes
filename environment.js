"use strict";
var path = require('path');

var environment = require(path.join(__dirname, '/environment_definitions.js'));

environment.CURRENT = environment.LOCAL;

module.exports = environment;