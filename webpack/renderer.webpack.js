const path = require('path');
module.exports = {
  resolve: {
    alias:{
      "@":path.resolve(__dirname,'../src')
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: require('./rules.webpack'),
  },
  // target: 'electron-renderer',
}