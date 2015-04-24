var sass = require('node-sass'),
    _ = require('lodash'),
    path = require('path'),
    autoprefixer = require('autoprefixer-core');

module.exports = function(srcPath, options) {

    return function(req, res, next) {

        var sassOptions = _.extend({
            file: path.join(srcPath, req.url.slice(0, -4) + ".scss"),
            outputStyle: 'extended'
        }, options);

        sass.render(sassOptions, function(err, result) {
            if (err) return next(err);
            var prefixed = autoprefixer.process(result.css);
            res.set('Content-Type', 'text/css')
                .status(200)
                .send(prefixed.css);
        });

    };

};