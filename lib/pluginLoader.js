var fs = require('fs'),
    path = require('path'),
    globby = require('globby'),
    debug = require('debug')('cyboard:pluginLoader'),
    win32 = process.platform === 'win32';

function getNpmPaths(start) {
    var parts = path.normalize(start).split(path.sep),
        dirs = [];

    while (parts.length > 0) {
        if (parts[parts.length - 1] !== 'node_modules') {
            dirs.push(parts.join(path.sep) + '/node_modules');
        }
        parts.pop();
    }

    if (process.env['NODE_PATH']) {
        dirs.concat(process.env['NODE_PATH'].split(win32 ? ';' : ':'));
    }

    dirs.push(process.env['HOME'] + '/.node_modules');
    dirs.push(process.env['HOME'] + '/.node_libraries');

    if (process.env['PREFIX']) {
        dirs.push(process.env['PREFIX'] + '/lib/node');
    }

    return dirs;
}


var IGNORED_PACKAGES = ['cyboard-widget'];

module.exports = function(injector) {

    function loadPlugin(name) {
        var childInjector, plugin;

        debug('Loading plugin %s.', name);

        try {
            pluginPath = path.dirname(require.resolve(name));
            plugin = require(name);
        } catch (e) {
            if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
                console.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' +
                    '  npm install %s --save', name, name);
            } else {
                throw e;
            }
        }

        var childInjector = injector.createChild([{
            'scriptsManager': ['value', injector.get('scriptsManager').bindTo(pluginPath)],
            'stylesManager': ['value', injector.get('stylesManager').bindTo(pluginPath)],
            'templateManager': ['value', injector.get('templateManager').bindTo(pluginPath)]
        }]);

        childInjector.invoke(plugin);
    }

    return {
        load: function(plugins) {

            if (!Array.isArray(plugins)) {
                plugins = [plugins];
            }

            plugins.forEach(function(plugin) {
                if (typeof plugin !== "string") {
                    throw new Error('Expect plugin to be a tring');
                }
                if (plugin.indexOf('*') !== -1) {
                    var patterns = getNpmPaths(process.cwd()).map(function(dir) {
                        return path.join(dir, plugin);
                    });
                    globby.sync(patterns).filter(function(modulePath) {
                        return IGNORED_PACKAGES.indexOf(path.basename(modulePath)) < 0;
                    }).forEach(function(modulePath) {
                        loadPlugin(modulePath);
                    });
                } else {
                    loadPlugin(plugin);
                }
            });
        }
    }
};
module.exports.$inject = ['injector'];