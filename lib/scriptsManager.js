var serveStatic = require('serve-static'),
    path = require('path'),
    fs = require('fs'),
    uglify = require('uglify-js'),
    _ = require('lodash'),
    send = require('send'),
    express = require('express');

function getLongestCommonPath(paths) {
    var referencePath = path.normalize(paths[0]).split(path.sep);

    if (paths.length === 1) {
        return path.dirname(paths[0]);
    }

    paths.forEach(function (currentPath) {
        currentPath = path.normalize(currentPath);
        while (referencePath.length > 0 && currentPath.indexOf(referencePath.join(path.sep)) !== 0) {
            referencePath.pop();
        }
    });

    return referencePath.join(path.sep) || path.sep;
}

module.exports = function createScriptsManager(app) {

    var router = express.Router(),
        scripts = {},
        modules = [];

    router.get('/index.js', function(req, res, next) {
        res.header('Content-Type', 'application/javascript');

        var toplevel = uglify.parse("angular.module('cyboard.plugins', " + JSON.stringify(modules) + ");");


        _.each(scripts, function(pluginScripts, pluginName) {
            var commonPath = getLongestCommonPath(pluginScripts);
            pluginScripts.forEach(function(script) {
                var code = fs.readFileSync(script, "utf8");
                toplevel = uglify.parse(code, {
                    filename: [pluginName, path.relative(commonPath, script)].join('/'),
                    toplevel: toplevel
                });
            });
        });

        res.send(toplevel.print_to_string());
    });

    router.get('/:plugin/:script(.*)', function(req, res, next) {
        var pluginScripts = scripts[req.params.plugin],
            commonPath = getLongestCommonPath(pluginScripts),
            scriptPath = path.join(commonPath, req.params.script);

        if (pluginScripts.indexOf(scriptPath) === -1) {
            return next('Script "' + req.params.script + '" is unknown for plugin "' + req.params.plugin + '"');
        }

        var stream = send(req, scriptPath);

        stream.pipe(res);
    });

    function serveScripts() {
        return router.apply(router, arguments);
    }

    serveScripts.push = function (localPath) {
        if ( !scripts[this.pluginName] ) {
            scripts[this.pluginName] = []
        };

        var pluginScripts = scripts[this.pluginName],
            basepath = this.basepath;

        pluginScripts.push.apply(pluginScripts, _.map(arguments, function(arg){
            return path.join(basepath, arg);
        }));
    };

    serveScripts.requireAngularModule = function (name) {
        modules.push(name)
    };

    serveScripts.bindTo = function(basepath) {
        return Object.create(this, {
            "basepath": {  writable: false, configurable: false, value: basepath },
            "pluginName": {  writable: false, configurable: false, value: path.basename(basepath) }
        });
    }

    return serveScripts;
}
module.exports.$inject = ['app'];