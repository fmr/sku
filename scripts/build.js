// First, ensure the build is running in production mode
process.env.NODE_ENV = 'production';

const { green, red } = require('chalk');
const {
  copyPublicFiles,
  cleanTargetDirectory,
  ensureTargetDirectory,
  cleanRenderJs
} = require('../lib/buildFileUtils');

const { run } = require('../lib/runWebpack');
const webpackCompiler = require('../config/webpack/webpack.compiler');

(async () => {
  try {
    await ensureTargetDirectory();
    await cleanTargetDirectory();
    await run(webpackCompiler);
    await cleanRenderJs();
    await copyPublicFiles();
    console.log(green('Sku build complete!'));
  } catch (error) {
    console.error(red(error));
    process.exit(1);
  }
})();
