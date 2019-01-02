'use strict';
var NODE_ENV = process.env.NODE_ENV;

var fs = require('fs');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin'); // html 템플릿 사용
var MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css 파일 추출
var CompressionWebpackPlugin = require('compression-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // uglify js 운영계
var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // uglify css 운영계

var appDirectory = fs.realpathSync(process.cwd()); // 디렉토리 경로

// var DEPLOY_VERSION = 'r_20181012'; // 배포버전

var resolveApp = function(relativePath) {
  return path.resolve(appDirectory, relativePath);
};

var paths = {
  appPath: resolveApp('src/app.js'),
  buildPath: resolveApp('build/production'), // 운영 배포 경로
  ktDevPath: resolveApp('build/ktdev'), // KT 개발자모드 배포 경로
  appHtml: resolveApp('src/index.html'),
  lpayPath: resolveApp('lib/Lpay.js'),
  wlPath: resolveApp('lib/wl6.js'),
  appSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
};
/**
 * Webpack 4에서 기본적으로 UglifyJS 지원하지만 css optimizing해서 추출하는 부분이
 * default 설정의 minimizer를 덮어 씌우므로 UglifyJS도 같이 따로 설정해줘야함.
 * KT 개발자모드 배포는 그대로 sourcemap 및 자체 옵션 사용
 */

var OPTI_KT = {
  minimize: false
};

var OPTI_PRODUCTION = {
  minimizer: [
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: true
    }),
    new OptimizeCSSAssetsPlugin({})
  ]
};

module.exports = {
  mode: NODE_ENV,
  entry: {
    app: paths.appPath,
  },
  output: {
    path: process.env.KT_DEV ? paths.ktDevPath : paths.buildPath,
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
  },
  optimization: process.env.KT_DEV ? OPTI_KT : OPTI_PRODUCTION,
  resolve: {
    extensions: ['.js'],
    /**
     * before: var file = require('file.js');
     * after: var file = require('file');
     */
    modules: ['node_modules', paths.appSrc, paths.appNodeModules], // 절대 경로 설정
  },
  externals: {
    Lpay: 'Lpay',
    gigagenie: 'gigagenie',
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
          MiniCssExtractPlugin.loader,
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
    new HtmlWebpackPlugin({
      template: paths.appHtml
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new CompressionWebpackPlugin({ // gzip 압축
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/i,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};
