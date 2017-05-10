import { resolve } from 'path';

async function getProjectConfig(basePath) {
    try {
        const projectPackage = await import(resolve(basePath, 'package.json'));
        return projectPackage.cyboard || {};
    } catch (e) {
        return {};
    }
}

export default async function createConfig(boardPath, options) {
    const { cwd = process.cwd() } = options;

    const projectConfig = await getProjectConfig(cwd);

    return {
        ...options,
        isDev: !!options.dev,
        cwd,
        configPath: resolve(cwd, boardPath || projectConfig.boardPath || './src/index.jsx'),
        credentials: resolve(cwd, options.credentials || projectConfig.credentials || './credentials.json'),
    };
}
