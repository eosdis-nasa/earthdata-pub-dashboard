const webpack = require('webpack');
const merge = require('webpack-merge');
// const WebpackBar = require('webpackbar'); // visual indicator in terminal for development

const CommonConfig = require('./webpack.common');

const DevConfig = merge.smartStrategy(
  {
    devtool: 'replace',
    'module.rules.use': 'prepend'
  }
)(CommonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: false,
    historyApiFallback: true,
    // host: '0.0.0.0', // Required for Docker -- someone will need to link this somehow
    // watchContentBase: true, // no longer valid with webpack-dev-server@4.4.0
    compress: true,
    port: process.env.PORT || 3000,
    // contentBase: 'dist', // no longer valid with webpack-dev-server@4.4.0
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          {
            // Creates `style` nodes from JS strings
            loader: 'style-loader',
          },
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // new WebpackBar()
  ]
});

module.exports = DevConfig;
