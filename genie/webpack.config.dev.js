'use strict';
var NODE_ENV = process.env.NODE_ENV;

var fs = require('fs');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var appDirectory = fs.realpathSync(process.cwd()); // 디렉토리 경로

var resolveApp = function(relativePath) {
  return path.resolve(appDirectory, relativePath);
};

var paths = {
  appPath: resolveApp('src/app.js'),
  appHtml: resolveApp('src/index.html'),
  buildPath: resolveApp('build'),
  appSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
};

module.exports = {
  mode: NODE_ENV,
  entry: {
    app: paths.appPath,
  },
  output: {
    path: paths.buildPath,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js'],
    /**
     * before: var file = require('file.js');
     * after: var file = require('file');
     */
    modules: ['node_modules', paths.appSrc, paths.appNodeModules], // 절대 경로 설정
  },
  externals: { // index.html에서 삽입한 스크립트 전역 변수 설정
    Lpay: 'Lpay',
    gigagenie: 'gigagenie',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: paths.appHtml
  },
  module: {
    rules: [
      // eslint
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
      },
      // babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
        exclude: paths.appHtml
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']), // 빌드 전 dist 삭제
    new HtmlWebpackPlugin({
      title: 'Output Management',
      template: paths.appHtml
    })
  ]
};
