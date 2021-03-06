#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const ensureGitignore = require('ensure-gitignore');
const { cwd, getPathFromCwd } = require('./cwd');

const writeFile = promisify(fs.writeFile);

const isTypeScript = require('./isTypeScript');
const { paths } = require('../context');
const {
  bundleReportFolder
} = require('../config/webpack/plugins/bundleAnalyzer');
const tslintConfig = require('../config/typescript/tslint.json');
const prettierConfig = require('../config/prettier/prettierConfig');
const eslintConfig = require('../config/eslint/eslintConfig');

const convertToForwardSlashPaths = pathStr => pathStr.replace(/\\/g, '/');
const addSep = p => `${p}${path.sep}`;
const prependBanner = str =>
  `/** THIS FILE IS GENERATED BY SKU, MANUAL CHANGES WILL BE DISCARDED **/\n${str}`;

const writeFileToCWD = async (fileName, content, { banner = true } = {}) => {
  const outPath = getPathFromCwd(fileName);
  const str = JSON.stringify(content, null, 2);
  const contentStr = banner ? prependBanner(str) : str;

  await writeFile(outPath, contentStr);
};

module.exports = async () => {
  // Ignore webpack bundle report output
  const gitIgnorePatterns = [addSep(bundleReportFolder)];
  const lintIgnorePatterns = [addSep(bundleReportFolder)];

  // Ignore webpack target directories
  const targetDirectory = addSep(paths.target.replace(addSep(cwd()), ''));
  gitIgnorePatterns.push(targetDirectory);
  lintIgnorePatterns.push(targetDirectory);

  if (isTypeScript()) {
    // Generate TypeScript configuration
    const tsConfigFileName = 'tsconfig.json';
    const tsConfig = {
      extends: require.resolve('../config/typescript/tsconfig.json'),
      include: paths.src,
      exclude: [getPathFromCwd('node_modules')]
    };
    await writeFileToCWD(tsConfigFileName, tsConfig);
    gitIgnorePatterns.push(tsConfigFileName);

    // Generate TSLint configuration
    const tslintConfigFileName = 'tslint.json';
    await writeFileToCWD(tslintConfigFileName, tslintConfig);
    gitIgnorePatterns.push(tslintConfigFileName);
  }

  // Generate ESLint configuration
  const eslintConfigFilename = '.eslintrc';
  await writeFileToCWD(eslintConfigFilename, eslintConfig);
  gitIgnorePatterns.push(eslintConfigFilename);

  // Generate Prettier configuration
  // NOTE: We are not generating a banner as prettier does not support the `JSON
  // with comments` format in `.prettierrc`. We are opting for this filename as it
  // takes the highest precendence of the available config names and we want to
  // ensure it is not accidentally overridden by a non-controlled config file.
  const prettierConfigFilename = '.prettierrc';
  await writeFileToCWD(prettierConfigFilename, prettierConfig, {
    banner: false
  });
  gitIgnorePatterns.push(prettierConfigFilename);

  // Write `.gitignore`
  await ensureGitignore({
    filepath: getPathFromCwd('.gitignore'),
    comment: 'managed by sku',
    patterns: gitIgnorePatterns.map(convertToForwardSlashPaths)
  });

  // Write `.eslintignore`
  await ensureGitignore({
    filepath: getPathFromCwd('.eslintignore'),
    comment: 'managed by sku',
    patterns: lintIgnorePatterns.map(convertToForwardSlashPaths)
  });

  // Write `.prettierignore`
  await ensureGitignore({
    filepath: getPathFromCwd('.prettierignore'),
    comment: 'managed by sku',
    patterns: lintIgnorePatterns.map(convertToForwardSlashPaths)
  });
};
