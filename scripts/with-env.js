#!/usr/bin/env node
/**
 * Cross-platform helper: set ENVFILE for react-native-config, then run a command.
 *
 * Usage:
 *   node scripts/with-env.js development react-native run-ios
 *   node scripts/with-env.js staging react-native run-android --mode=stagingDebug
 */
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ALLOWED_ENVIRONMENTS = new Set(['development', 'staging', 'production']);

const environment = process.argv[2];
const commandArgs = process.argv.slice(3);

if (!environment || !ALLOWED_ENVIRONMENTS.has(environment)) {
  console.error(
    `Usage: node scripts/with-env.js <development|staging|production> <command...>`,
  );
  process.exit(1);
}

if (commandArgs.length === 0) {
  console.error('Missing command to run after the environment name.');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const envFileName = `.env.${environment}`;
const envFilePath = path.join(rootDir, envFileName);

if (!fs.existsSync(envFilePath)) {
  console.error(
    `Missing ${envFileName}. Copy the example file first:\n` +
      `  cp ${envFileName}.example ${envFileName}`,
  );
  process.exit(1);
}

const result = spawnSync(commandArgs[0], commandArgs.slice(1), {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    ENVFILE: envFileName,
    APP_ENV: environment,
  },
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
