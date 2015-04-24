var _ = require('lodash'),
    Router = require('express').Router,
    send = require('send');

module.exports = StateProviderMiddleware;

function StateProviderMiddleware (indexFile, stateConfig) {

    var router = new Router(),
        states = {};

    function handleRequest(req, res, next) {
        var stream = send(req, indexFile);

        // forward non-404 errors
        stream.on('error', function error(err) {
            next(err.status === 404 ? null : err);
        })

        stream.pipe(res);
    }

    stateConfig({
        state: function(name, config) {
            states[name] = config.url || '';
            return this;
        }
    });

    _.each(states, function(url, name) {
        var nameParts = name.split('.');
        while (nameParts.length > 1) {
            url = states[nameParts.shift()] + url;
        }
        router.get(url, handleRequest);
    });

    return router;
}
