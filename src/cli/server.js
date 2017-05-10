/* eslint no-console: 0 */
import createDebug from 'debug';
import path from 'path';
import fs from 'fs';
import historyApiFallback from 'connect-history-api-fallback';
import express from 'express';
import serveStatic from 'serve-static';
import { Server as HttpServer } from 'http';
import webpackMiddleware from 'webpack-dev-middleware';
import XMLHttpRequest from 'xhr2';
import { parseConfig } from '../parseConfig';
import { mergeWidgetBackends } from '../mergeWidgetBackends';
import { observableEventSource } from '../observableEventSource';
import { WidgetCacheSubject } from '../subjects/WidgetCacheSubject';
import createCompiler from '../compiler';

// we need a global XMLHttpRequest to make Rx.Observable.dom.ajax working isomporphic
// @see
global.XMLHttpRequest = XMLHttpRequest;

const debug = createDebug('cyboard.cli');

function loadCredentials(file) {
    const resolved = path.resolve(file);
    try {
        fs.accessSync(resolved, fs.constants.R_OK);
        debug(`Using credentials file from ${resolved}`);
        return require(resolved); // eslint-disable-line global-require, import/no-dynamic-require
    } catch (e) {
        debug("Can't find credentials file or file is not readable");
        return {};
    }
}

function startServer(env) {
    const {
        isDev,
        configPath,
        credentials,
        port,
    } = env;

    const auth = loadCredentials(credentials);
    const cyboardConfig = parseConfig(require(configPath).default(auth));
    const backends = mergeWidgetBackends(cyboardConfig);
    const compiler = createCompiler(configPath, isDev);

    const app = express();
    app.use(historyApiFallback());
    app.use('/events', observableEventSource(backends));

    if (isDev) {
        debug('Using wepack devserver middleware');
        app.use(webpackMiddleware(compiler, {
            contentBase: 'src',
            stats: {
                assets: false,
                colors: true,
                hash: false,
                timings: false,
                chunks: false,
                chunkModules: false,
                modules: false,
            },
        }));
    } else {
        debug('Compiling static frontend build');
        compiler.run((err, stats) => {
            debug(`Frontend compiled successful. Hash is ${stats.hash}`);
        });
        console.log(compiler.options.output.path);
        app.use('/', serveStatic(compiler.options.output.path))
    }

    app.listen(port);
}

export default startServer;
