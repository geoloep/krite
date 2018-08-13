var path = require('path')
var webpack = require('webpack')

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/main.ts',
  mode: process.env.NODE_ENV,
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'krite.js',
    library: 'Krite',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    symlinks: false,
  },
  devtool: '#eval-source-map'
}