/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var mixin = require('lodash').mixin;
var proto = require('express').application;
var Route = require('express').Route;
var Router = require('express').Router;
var req = require('express').request;
var res = require('express').response;
var server = require('./lib/server');

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function createApplication() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, proto);
  mixin(app, server);
  mixin(app, EventEmitter.prototype);

  app.request = { __proto__: req, app: app };
  app.response = { __proto__: res, app: app };
  app.init();
  
  return app;
}

/**
 * Expose the prototypes.
 */
exports.application = proto;
exports.request = req;
exports.response = res;

/**
 * Expose constructors.
 */
exports.Route = Route;
exports.Router = Router;