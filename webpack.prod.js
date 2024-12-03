const path = require('path');
const  merge  = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require('./package.json');

const CommonConfig = require('./webpack.common');

const MainConfig = merge.smartStrategy({
  devtool: 'replace',  // Consider if you really want to replace or extend the configurations
  'module.rules.use': 'prepend'
})(CommonConfig, {
  mode: 'production',
  devtool: 'source-map',  // Source maps in production can be disabled for smaller bundles unless needed for debugging
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
      new TerserPlugin({
        parallel: true,
        include: /\.js$/,
        terserOptions: {
          compress: {
            comparisons: false,
            drop_console: true, // Remove console logs in production
          },
          mangle: true,
          output: {
            comments: false, // Remove comments to reduce size
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
          chunks: 'all'
        }
      }
    },
    runtimeChunk: 'single', // Creates a single runtime bundle for all chunks
    sideEffects: true // Tree shaking to remove unused code
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',  // Handles static assets like images
        generator: {
          filename: 'images/app/src/assets/images/[hash][ext][query]'  // Stores images in an 'images' directory with hashed filenames
        }
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
