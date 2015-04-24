Plugin Basics
=============

Each cyboard plugin is a node module. It has to export a function in its main file, which is `index.js` by default or 
can be set in package.json. The exported function will be called one time when the cyboard server is started. It will
be invoked by a dependency injector which is able to inject the following services:

- `app`
- `authManager`
- `pluginLoader`
- `scriptsManager`
- `stylesManager`
- `templateManager`
- `widgetFactory`

The required services can be defined in an array under the key `$inject` on the plugin function.

The basic structure of an plugin looks like this:

    module.exports = function(widgets, templates, styles) {
        // This function will be called one time when the plugin was loaded
    };
    
    module.exports.$inject = ['widgetFactory', 'templateManager', 'stylesManager'];
