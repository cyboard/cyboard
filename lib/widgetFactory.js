module.exports = function createWidgetFactory() {

    /**
     * A map of known widget factories
     *
     * @type {object}
     * @private
     */
    var factories = {};

    return {

        /**
         * Create a new widget instance
         *
         * @param {string} type
         * @param {object} options
         * @returns {events.EventEmitter}
         */
        create: function(type, options) {
            if (!factories[type]) {
                throw new Error('Widget type "' + type + '" unknown.');
            }

            var widget = factories[type](options);
            widget.type = type;

            return widget;
        },

        /**
         * Register a new widget factory
         *
         * @param {string} type
         * @param {function(object: options):events.EventEmitter} factory
         */
        register: function(type, factory) {
            factories[type] = factory;
        }
    };

};