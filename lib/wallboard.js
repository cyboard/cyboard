var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    slug = require('slug'),
    _ = require('lodash');

/**
 * Expose `Wallboard`
 * @type {Wallboard}
 */
module.exports = Wallboard;

/**
 * Constructor to create a new wallboard
 *
 * @param {string} name Name of this wallboard
 * @param {function(string, object)} widgetFactory
 * @constructor
 */
function Wallboard(name, widgetFactory) {

	/**
	 * Name of this wallboard
	 * @type {string}
	 */
	this._name = name;

    /**
     * @type {function(string, object)}
     * @private
     */
    this._widgetFactory = widgetFactory

    /**
     * Widgets in this board
     *
     * @type {EventEmitter[]}
     * @private
     */
    this._widgets = [];

    this._currentData = {};
}
util.inherits(Wallboard, EventEmitter);

/**
 * Returns the normalized name of this board. This is usually used for url slugs
 *
 * @returns {string}
 */
Wallboard.prototype.getSlug = function() {
    return slug(this._name).toLowerCase();
};

/**
 * Return the boards name
 *
 * @returns {string}
 */
Wallboard.prototype.getName = function() {
    return this._name;
};

/**
 * Returns the current data contained in this board. This includes
 * last emmited data of all widgets.
 *
 * @returns {{}}
 */
Wallboard.prototype.getCurrentData = function() {
    return this._currentData;
};

Wallboard.prototype.getWidgetsConfig = function() {
    return this._widgets;
};

/**
 * Adds a widget to the wallboard
 *
 * @param {Widget} widget
 */
Wallboard.prototype.addWidget = function(module, options) {

    var self = this,
        idx = this._widgets.length,
        type;

    if (typeof module === "string") {
        module = this._widgetFactory.create(module, options || {});
    }

    if (!module.on) {
        throw new Error('Expect method on() on widget to subscripe to data event.');
    }

    module.on('data', function(widgetData) {
        var data = {};
        data[idx] = widgetData;
        self.emit('data', data);
        _.extend(self._currentData, data);
    });

    module.on('error', function(msg) {
        console.error(module.type + "-" + idx + ": " + msg);
    });

    this._widgets.push({
        id: idx,
        type: module.type,
        board: self.getSlug(),
        config: options,
    });

    return module;
};
