const Config = require('webpack-config').default;
const webpack = require('webpack');
const conf = new Config().extend('@fesk/scripts/webpack').merge({
  plugins: [
    new webpack.EnvironmentPlugin({
      COLLECTION_SERVER: process.env.COLLECTION_SERVER,
      ROOT_MANIFEST_URL: process.env.ROOT_MANIFEST_URL,
    }),
  ],
});

conf.plugins[0].opts.metalsmithDest = './assets';

module.exports = conf;
