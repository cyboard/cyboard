var _ = require('lodash'),
    util = require('util'),
	Wallboard = require('./wallboard'),
    pluginLoader = require('./pluginLoader'),
    widgetFactory = require('./widgetFactory'),
	io = require('socket.io'),
	express = require('express'),
    http = require('http'),
    serveStatic = require('serve-static'),
    browserify = require('browserify-middleware'),
    stateProviderMiddleware = require('./middleware/stateProviderMiddleware'),
    serveSass = require('./middleware/serve-sass'),
    path = require('path'),
    pathRegexp = require('path-to-regexp'),
    di = require('di'),
    debug = require('debug')('cyboard:server'),
    templateManager = require('./templateManager'),
    scriptsManager = require('./scriptsManager'),
    stylesManager = require('./stylesManager'),
    authManager = require('./authManager');

var server = module.exports = {};

/**
 * Initializes the wallboard server
 */
server.init = function() {
	express.application.init.apply(this, arguments);

    var appHtmlPath = path.join(path.dirname(__dirname), 'public', 'index.html');

    if (!this.get('version')) {
        this.set('version', require('../package').version);
    }

    this._injector = new di.Injector([{
        'app': ['value', this],
        'templateManager': ['factory', templateManager],
        'stylesManager': ['factory', stylesManager],
        'scriptsManager': ['factory', scriptsManager],
        'widgetFactory': ['factory', widgetFactory],
        'pluginLoader': ['factory', pluginLoader],
        'authManager': ['factory', authManager]
    }]);

    if (this.get('env') === 'development') {
        this.use('/js/jquery.js', serveStatic(require.resolve('jquery/dist/jquery.js')));
        this.use('/js/lodash.js', serveStatic(require.resolve('lodash/index.js')));
        this.use('/js/angular.js', serveStatic(require.resolve('angular/angular.js')));
        this.use('/js/angular-ui-router.js', serveStatic(require.resolve('angular-ui-router/release/angular-ui-router.js')));
        this.use('/js/client.js', browserify(__dirname + '/client.js', {basedir: __dirname}));

        this.set('version', this.get('version') + '-dev.' + Date.now());

        this.use('/css/styles.css', this._injector.get('stylesManager'));
        this.use('/js/widgets', this._injector.get('scriptsManager'));
    }

    this.use('/', stateProviderMiddleware(appHtmlPath, require('./client/config/states')));
    this.use('/', serveStatic(__dirname + '/../public'));

    this.get('/api/boards', this._deliverBoards.bind(this));

    this._boards = {};
    this._io = io();

    this._injector.get('pluginLoader').load(['cyboard-*']);

    this._io.on('connection', this._onSocketConnection.bind(this));
    debug('Server version %s initialized', this.get('version'));
};

/**
 * Callack which is called when a new client connects through socket.io
 *
 * @param {socketio.Socket} socket
 * @private
 */
server._onSocketConnection = function(socket) {
    var self = this;

    socket.on('join', function(boardSlug) {
        if (self._boards[boardSlug]) {
            debug('Client joining board %s', boardSlug);
            socket.join(boardSlug);
            socket.emit('data', self._boards[boardSlug].getCurrentData());
        } else {
            debug('Client tried to join not existand board %s', boardSlug);
        }
    });

    socket.on('leave', function(boardSlug) {
        debug('Disconected socket connection');
        socket.leave(boardSlug);
    });

    socket.on('ping', function(sequence) {
        socket.emit('pong', sequence);
    })

    socket.emit('checkversion', this.get('version'));
    debug('Received socket connection.');
};

/**
 * Creates a new wallboard and returns the instance
 *
 * @param {string} name
 * @returns {Wallboard}
 */
server.createBoard = function(name) {
	var self = this,
        board = new Wallboard(name, this._injector.get('widgetFactory'));

	board.on('data', function(data) {
        if (self._io) {
            self._io.to(board.getSlug()).emit('data', data);
        }
    });

    this._boards[board.getSlug()] = board;

    debug('Created board %s with slug %s', name, board.getSlug());

	return board;
};

/**
 * Middleware callback to deliver a json with all known boards
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 * @private
 */
server._deliverBoards = function(req, res, next) {
    var result = {};

    _.each(this._boards, function(board) {
        var slug = board.getSlug();
        result[slug] = {
            name: board.getName(),
            slug: slug,
            widgets: board.getWidgetsConfig()
        };
    });

    res.json(result);
};

/**
 * Load a global auth file into the auth manager.
 *
 * @param {string} path
 */
server.loadAuth = function(path) {
    var authManager = this._injector.get('authManager');
    authManager.load(path);
}

/**
 * Load a plugin by a given node-module name or absolute path
 *
 * @param {string|string[]} plugin
 */
server.loadPlugin = function(plugin) {
    this._injector.get('pluginLoader').load(plugin);
}

/**
 * Proxy for `http.Server.listen()`. Creates a http server instance, bind socket.io o it,
 * add this server instance as an handler and start listening the given interface.
 *
 * @returns {http.Server}
 */
server.listen = function(){
    var server = http.createServer(this);
    this._io.attach(server);
    return server.listen.apply(server, arguments);
};