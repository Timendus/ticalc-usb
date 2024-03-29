const path = require('path');

module.exports = {
  mode: 'development',

  entry: {
    'index': './src/index.js'
  },

  output: {
    globalObject: 'this',
    library: 'ticalc-usb',
    libraryTarget: 'umd',
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },

  resolve: {
    fallback: {
      util: false
    }
  }
};
