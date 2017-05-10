const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const path = require('path');


// Get environment variables to inject into our app.
const env = getClientEnvironment();

console.log(
    process.cwd(),
    path.resolve(__dirname, '../src'),
);

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
    // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
    // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
    devtool: 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: [
        // We ship a few polyfills by default:
        require.resolve('./polyfills'),
        require.resolve('../src/frontend'),
    ],
    output: {
        // Next line is not used in dev but WebpackDevServer crashes without it:
        path: paths.appBuild,
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: 'static/js/bundle.js',
        // This is the URL that app is served from. We use "/" in development.
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
                query: {
                    presets: [require.resolve('babel-preset-react-app')],
                    plugins: [require.resolve('babel-plugin-transform-es2015-modules-commonjs')],
                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                    // It enables caching results in ./node_modules/.cache/babel-loader/
                    // directory for faster rebuilds.
                    cacheDirectory: true,
                },
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
        }),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
        new webpack.DefinePlugin(env),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};
