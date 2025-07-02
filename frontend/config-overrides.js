const { override, overrideDevServer } = require('customize-cra');

const devServerConfig = () => config => {
  return {
    ...config,
    allowedHosts: 'all'
  };
};

module.exports = {
  webpack: override(),
  devServer: overrideDevServer(devServerConfig())
};
