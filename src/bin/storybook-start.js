#!/usr/bin/env node

import path from 'path';
import program from 'commander';
import shelljs from 'shelljs';
import Server from '../server';

program
  .option('-h, --host <host>', 'host to listen on')
  .option('-p, --port <port>', 'port to listen on')
  .option('-c, --config-dir [dir-name]', 'storybook config directory')
  .option('-r, --reset-cache', 'reset react native packager')
  .option('-s, --skip-packager', 'run only storybook server')
  .option('-i, --manual-id', 'allow multiple users to work with same storybook')
  .parse(process.argv);

const projectDir = path.resolve();
const configDir = path.resolve(program.configDir || './storybook');
const listenAddr = [program.port];
if (program.host) {
  listenAddr.push(program.host);
}

const server = new Server({projectDir, configDir, manualId: program.manualId});
server.listen(...listenAddr, function (err) {
  if (err) {
    throw err;
  }
  const address = `http://${program.host || 'localhost'}:${program.port}/`;
  console.info(`\nReact Native Storybook started on => ${address}\n`);
});

if (!program.skipPackager) {
  const projectRoots = configDir === projectDir ? [configDir] : [configDir, projectDir];

// RN packager
  shelljs.exec([
    'node node_modules/react-native/local-cli/cli.js start',
    `--projectRoots ${projectRoots.join(',')}`,
    `--root ${projectDir}`,
    program.resetCache && '--reset-cache'
  ].filter(x => x).join(' '), {async: true});

}
