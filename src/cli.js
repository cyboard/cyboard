#!/usr/bin/env node

/* eslint no-console: 0 */
import program from 'commander';
import createDebug from 'debug';
import { jsVariants } from 'interpret';
import packageJson from '../package.json';
import { createCompiler } from './compiler';
import getConfig from './cli/config';
import startServer from './cli/server';
import buildFrontend from './cli/builder';

const { version } = packageJson;
const debug = createDebug('cyboard.cli');

function validateConfigPath(env) {
    if (!env.configPath) {
        console.log(`No ${cli.configName} found.`);
        return false;
    }
    debug(`Using Cyboardfile from ${env.configPath}`);
    return true;
}

program.version(version)
    .option('--cwd [path]', 'Sets the current working directory', process.cwd())
    .option('--cache [path]', 'Set the directory for caching', './.cyboard');

program.command('start [cyboardfile]')
    .description('Starts a cyboard server')
    .option('-p, --port [number]', 'Sets the used port number for catalog server', '3000')
    .option('-c, --credentials [path]', 'Sets the path to the credentials file')
    .option('-d, --dev', 'Start the server in devmode, which runs an internal webpack devserver')
    .action(async (boardPath, options) => startServer(await getConfig(boardPath, options)));

program.command('warmup [cyboardfile]')
    .description('Warm up cache with static frontend build')
    .action((configPath, { parent: { cache, cwd } }) =>
        buildFrontend({ configPath, cache, cwd }),
    );

program.parse(process.argv);

if (!program.args.length) program.help();
