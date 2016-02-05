"use strict"

var architect = require("architect");
var debug = require("debug")("Transact:main");

var path = require('path');
var configPath = path.join(__dirname, "config.js");
var config = architect.loadConfig(configPath);

architect.createApp(config, function (err, app) {
  if (err) throw err;
  debug("app ready");
});