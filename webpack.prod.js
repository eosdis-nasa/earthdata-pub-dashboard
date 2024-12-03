const path = require('path');
const  merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // Corrected name for webpack 5
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
      new TerserPlugin({ // Use the correct plugin name
        parallel: true,
        include: /\.js$/,
        terserOptions: {
          compress: {
            comparisons: false,
            drop_console: true, // Optionally remove console logs
          },
          mangle: true,
          output: {
            comments: false, // Remove comments
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          maxSize: 500000 // Ensures splitting for large bundles
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all'
        }
      }
    },
    runtimeChunk: 'single', // Optimizes the runtime build to a single chunk
    sideEffects: true // Enables tree shaking
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // Proper handling of static assets
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash:8]-' + pkg.version + '.css',
      chunkFilename: '[id].[chunkhash:8]-' + pkg.version + '.css'
    })
  ]
});

module.exports = MainConfig;
