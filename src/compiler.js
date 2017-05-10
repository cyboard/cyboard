import webpack from 'webpack';
import path from 'path';
import createDebug from 'debug';

const debug = createDebug('cyboard.compiler');

export default function createCompiler(cyboardfile, isDev = false) {
    const configPath = path.resolve(__dirname, isDev
        ? '../config/webpack.config.dev'
        : '../config/webpack.config.prod');

    debug(`Using wepack config from ${configPath}`);

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const config = require(configPath);

    config.resolve.alias['injected-boards-config'] = cyboardfile;

    return webpack(config);
}
