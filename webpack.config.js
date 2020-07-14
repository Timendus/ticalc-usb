const path = require('path');

module.exports = {
  entry: {
    'index': './src/index.js'
  },

  output: {
    library: 'ticalc-usb',
    libraryTarget: 'umd',
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  }
};
