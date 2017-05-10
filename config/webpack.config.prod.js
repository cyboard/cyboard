// @remove-on-eject-begin
/**
* Copyright (c) 2015-present, Facebook, Inc.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree. An additional grant
* of patent rights can be found in the PATENTS file in the same directory.
*/
// @remove-on-eject-end

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');

// @remove-on-eject-begin
// `path` is not used after eject - see https://github.com/facebookincubator/create-react-app/issues/1174
const path = require('path');
// @remove-on-eject-end

// Get environment variables to inject into our app.
const env = getClientEnvironment();

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: 'source-map',
    // In production, we only want to load the polyfills and the app code.
    entry: [
        require.resolve('./polyfills'),
        require.resolve('../src/frontend'),
    ],
    output: {
        // The build folder.
        path: paths.appBuild,
        // Generated JS file names (with nested folders).
        // There will be one main bundle, and one file per asynchronous chunk.
        // We don't currently advertise code splitting but Webpack supports it.
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
        // We inferred the "public path" (such as / or /my-project) from homepage.
        publicPath: '/',
    },
    resolve: {
        // This allows you to set a fallback for where Webpack should look for modules.
        // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
        // We use `fallback` instead of `root` because we want `node_modules` to "win"
        // if there any conflicts. This matches Node resolution mechanism.
        // https://github.com/facebookincubator/create-react-app/issues/253
        modules: [path.resolve(__dirname, '../../../'), 'node_modules'],
        // These are the reasonable defaults supported by the Node ecosystem.
        // We also include JSX as a common component filename extension to support
        // some tools, although we do not recommend using it, see:
        // https://github.com/facebookincubator/create-react-app/issues/290
        extensions: ['.js', '.json', '.jsx'],
        alias: {
            cyboard: 'cyboard/src',
        },
    },
    module: {
        // Suppress warning in iconv-loader which is used by isomorphic fetch
        exprContextRegExp: /$^/,
        exprContextCritical: false,
        rules: [
            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            // {
            //     enforce: 'pre',
            //     test: /\.(js|jsx)$/,
            //     loader: 'eslint-loader',
            //     include: paths.appSrc,
            // },
            //
            // Process JS with Babel.
            {
                test: /\.(js|jsx)$/,
                include: [
                    process.cwd(),
                    path.resolve(__dirname, '../src'),
                ],
                loader: 'babel-loader',
                // @remove-on-eject-begin
                query: {
                    presets: [require.resolve('babel-preset-react-app')],
                    plugins: [require.resolve('babel-plugin-transform-es2015-modules-commonjs')],
                },
                // @remove-on-eject-end
            },
            // JSON is not enabled by default in Webpack but both Node and Browserify
            // allow it implicitly so we also enable it.
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            // "file" loader for svg
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader',
                query: {
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
        ],
    },
    plugins: [
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            title: 'Cyboard Wallboard',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV was set to production here.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin(env),
        // This helps ensure the builds are consistent if source hasn't changed:
        new webpack.optimize.OccurrenceOrderPlugin(),
        // Try to dedupe duplicated modules, if any:
        new webpack.optimize.DedupePlugin(),
        // Minify the code.
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true, // React doesn't support IE8
                warnings: false,
            },
            mangle: {
                screw_ie8: true,
            },
            output: {
                comments: false,
                screw_ie8: true,
            },
            sourceMap: true,
        }),
        // Generate a manifest file which contains a mapping of all asset filenames
        // to their corresponding output file so that tools can pick it up without
        // having to parse `index.html`.
        new ManifestPlugin({
            fileName: 'asset-manifest.json',
        }),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};
