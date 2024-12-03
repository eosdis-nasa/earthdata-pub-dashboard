const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJsPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require('./package.json');
const CommonConfig = require('./webpack.common');
const { merge } = require('webpack-merge'); // Ensure the merge module is imported correctly

const MainConfig = merge.smartStrategy({
  devtool: 'replace',
  'module.rules.use': 'prepend'
})(CommonConfig, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dashboard/' // Ensure publicPath is set if you serve from a specific base url
  },
  optimization: {
    nodeEnv: 'production',
    concatenateModules: true,
    chunkIds: 'deterministic',
    minimizer: [
      new TerserJsPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            comparisons: false, // Avoid optimizations that could break code logic
          },
          format: {
            comments: false, // Remove comments in the production build
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
          maxSize: 500000
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true // Enforce this caching group
        }
      }
    },
    runtimeChunk: 'single', // Optimizes runtime code management
    sideEffects: true // Optimize based on the sideEffects flag in package.json
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.png$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]' // Ensures images are hashed for caching
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8]-' + pkg.version + '.css',
      chunkFilename: '[id].[contenthash:8]-' + pkg.version + '.css'
    })
  ]
});

module.exports = MainConfig;
