Creating Widgets
================

A widget is basically a factory function wich returns a EventEmitter instance. These EventEmitter have to trigger
a `data` event each time the widget wants to update its data. There a many ways to trigger this event like streams,
webhooks or basically an interval function which requests data from another server.

To register a new widget we need a [Plugin](pluginBasics.md) at first. This plugin must require the `widgetManager`
to be injected. Once we have the widgetManager we can add our factory function with the `register()` method.  

    var events = require('events');
    
    module.exports = function(widgets) {
    
        widgets.register('clock', function(options) {
            var emitter = new events.EventEmitter;
            
            // generate data and call emitter.emit('data', some Data)
            
            return emitter;
        });
    };
    
    module.exports.$inject = ['widgetFactory'];
    
Unlike the plguin function which is called one time the plugin was loaded, our widget factory will be called each time
a widget is added to a board. This gives us great control to decide when a code has to be executed.