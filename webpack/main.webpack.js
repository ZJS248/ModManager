const path = require('path');
module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    alias:{
      "@":path.resolve(__dirname,'../src')
    },
  },
  entry: './electron/main.ts',
  module: {
    rules: require('./rules.webpack'),
  },
  // target: 'electron-main',
}