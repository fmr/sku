const ListExternalsPlugin = require('../../../utils/ListExternalsWebpackPlugin');

module.exports = {
  publicPath: 'https://somecdn.com',
  port: 8200,
  dangerouslySetWebpackConfig: config => {
    if (config.name === 'render') {
      config.plugins.push(new ListExternalsPlugin());
    }

    return config;
  }
};
