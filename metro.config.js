const fs = require('fs');
const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const projectRoot = __dirname;

const ALIASES = {
  '@app': path.resolve(projectRoot, 'src/app'),
  '@components': path.resolve(projectRoot, 'src/components'),
  '@config': path.resolve(projectRoot, 'src/config'),
  '@database': path.resolve(projectRoot, 'src/database'),
  '@features': path.resolve(projectRoot, 'src/features'),
  '@hooks': path.resolve(projectRoot, 'src/hooks'),
  '@navigation': path.resolve(projectRoot, 'src/navigation'),
  '@services': path.resolve(projectRoot, 'src/services'),
  '@store': path.resolve(projectRoot, 'src/store'),
  '@theme': path.resolve(projectRoot, 'src/theme'),
  '@app-types': path.resolve(projectRoot, 'src/types'),
  '@utils': path.resolve(projectRoot, 'src/utils'),
};

function resolveAliasFile(moduleName) {
  for (const [alias, aliasRoot] of Object.entries(ALIASES)) {
    if (moduleName !== alias && !moduleName.startsWith(`${alias}/`)) {
      continue;
    }

    const remainder =
      moduleName === alias ? '' : moduleName.slice(alias.length + 1);
    const base = remainder ? path.join(aliasRoot, remainder) : aliasRoot;

    const candidates = [
      `${base}.tsx`,
      `${base}.ts`,
      `${base}.jsx`,
      `${base}.js`,
      path.join(base, 'index.tsx'),
      path.join(base, 'index.ts'),
      path.join(base, 'index.js'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Path aliases must be resolved here — Metro resolves imports before Babel
 * rewrites them via babel-plugin-module-resolver.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest(context, moduleName, platform) {
      const aliased = resolveAliasFile(moduleName);
      if (aliased) {
        return {
          filePath: aliased,
          type: 'sourceFile',
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
