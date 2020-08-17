const Config = require('webpack-config').default;
const webpack = require('webpack');
const conf = new Config().extend('@fesk/scripts/webpack').merge({
  plugins: [
    new webpack.EnvironmentPlugin({
      COLLECTION_SERVER: 'https://raw.githubusercontent.com/ryanfb/iiif-universe/gh-pages/iiif-universe.json',
    }),
  ],
});

conf.plugins[0].opts.metalsmithDest = './assets';

module.exports = conf;
