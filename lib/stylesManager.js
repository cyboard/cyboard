var path = require('path'),
    serveSass = require('./middleware/serve-sass'),
    sass = require('node-sass'),
    css = require('css'),
    postcss = require('postcss'),
    autoprefixer = require('autoprefixer-core'),
    walk = require('rework-walk'),
    _ = require('lodash');

var MODULE_PATH = /^@([^\/]*)\/(.*)$/;

module.exports = function createStylesManager(app) {

    var widgetStylesheets = {},
        boardStylesheets = {},
        globalStylesheets = [__dirname + '/../styles/styles.scss'],
        includePaths = {},
        defaultOptions;

    defaultOptions = {
        importer: function(url, prev) {
            var match = url.match(MODULE_PATH);

            if (!match) {
                return {file: url};
            }

        }
    }

    function sassMiddleware(req, res, next) {
        var toplevel;

        function compileSass(file) {
            var result = sass.renderSync(_.defaults({
                file: file
            }, defaultOptions));

            return css.parse(result.css);
        }

        function appendCss(ast) {
            if (toplevel) {
                toplevel.stylesheet.rules = toplevel.stylesheet.rules.concat(ast.stylesheet.rules);
                toplevel.stylesheet.parsingErrors = toplevel.stylesheet.parsingErrors.concat(ast.stylesheet.parsingErrors);
            } else {
                toplevel = ast;
            }
        }

        function prependSelector(ast, base, attrName, attrValue) {
            walk(ast.stylesheet, function (rule, node) {
                if (!rule.selectors) return rule;
                rule.selectors = rule.selectors.map(function (selector) {
                    if (selector.indexOf(base) === 0) {
                        selector = selector.slice(base.length);
                    }
                    return base + '[' + attrName + '="' + attrValue + '"] ' + selector;
                });
            });

            return ast;
        }

        _.each(globalStylesheets, function(stylesheet) {
            var ast = compileSass(stylesheet);
            appendCss(ast);
        });

        _.each(boardStylesheets, function(stylesheets, slug) {
            _.each(stylesheets, function (stylesheet) {
                var ast = compileSass(stylesheet);
                ast = prependSelector(ast, '.board', 'slug', slug);
                appendCss(ast);
            });
        });

        _.each(widgetStylesheets, function(stylesheets, name) {
            _.each(stylesheets, function (stylesheet) {
                var ast = compileSass(stylesheet);
                ast = prependSelector(ast, 'widget', 'type', name);
                appendCss(ast);
            });
        });

        // @imports need to be before all other css rules. So we split them
        // and append all other rules after the imports.
        var partition = _.partition(toplevel.stylesheet.rules, function(rule) {
            return rule.type === "import";
        });
        toplevel.stylesheet.rules = partition[0].concat(partition[1]);

        postcss([autoprefixer]).process(css.stringify(toplevel))
            .then(function(result) {
                result.warnings().forEach(function (warn) {
                    console.warn(warn.toString());
                });
                res.status(200)
                    .header('Content-Type', 'text/css')
                    .send(result.css);
            }, function(error) {
                res.status(500)
                    .send(error);
            });
    }

    sassMiddleware.addWidgetStylesheet = function(widgetName, localPath) {
        widgetStylesheets[widgetName] = widgetStylesheets[widgetName] || [];
        widgetStylesheets[widgetName].push(path.join(this.basepath, localPath));
    };

    sassMiddleware.addGlobalStylesheet = function(localPath) {
        globalStylesheets.push(path.join(this.basepath, localPath));
    };

    sassMiddleware.addBoardStylesheet = function(boardSlug, localPath) {
        boardStylesheets[boardSlug] = boardStylesheets[boardSlug] || [];
        boardStylesheets[boardSlug].push(path.join(this.basepath, localPath));
    };

    sassMiddleware.addIncludePath = function(localPath) {
        if ( !includePaths[this.pluginName] ) {
            includePaths[this.pluginName] = []
        };

        includePaths[this.pluginName].push(path.join(this.basepath, localPath));
    };

    sassMiddleware.bindTo = function(basepath) {
        return Object.create(this, {
            "basepath": {  writable: false, configurable: false, value: basepath },
            "pluginName": {  writable: false, configurable: false, value: path.basename(basepath) }
        });
    };

    return sassMiddleware;
}
module.exports.$inject = ['app']