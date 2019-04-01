const Config = require('webpack-config').default;
const webpack = require('webpack');
const conf = new Config().extend('@fesk/scripts/webpack').merge({
  plugins: [
    new webpack.EnvironmentPlugin({
      COLLECTION_SERVER: 'https://iiif-collection.ch.digtest.co.uk/p3/',
    }),
  ],
});

conf.plugins[0].opts.metalsmithDest = './assets';

module.exports = conf;