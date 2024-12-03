const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJsPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require('./package.json');

const CommonConfig = require('./webpack.common');

const MainConfig = merge.smartStrategy({
  devtool: 'replace',
  'module.rules.use': 'prepend'
})(CommonConfig, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    nodeEnv: 'production',
    concatenateModules: true,
    chunkIds: 'deterministic',
    minimizer: [
      new TerserJsPlugin({ // These properties are valid: object { test?, include?, exclude?, terserOptions?, extractComments?, parallel?, minify? }
        // cache: true,
        parallel: true,
        // sourceMap: true,
        include: /\.js$/
      }),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          maxSize: 500000
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all'
        }
      }
    },
    runtimeChunk: true,
    sideEffects: true
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images/', // Defines the path for output images
              name: '[name].[ext]',  // Maintains the original file name
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // new webpack.HashedModuleIdsPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash:8]-' + pkg.version + '.css',
      chunkFilename: '[id].[chunkhash:8]-' + pkg.version + '.css'
    })
  ]
});

module.exports = MainConfig;
