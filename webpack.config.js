const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

const basename = process.env.BASENAME || '/';
const pathPrefix = basename.endsWith('/')
  ? basename.slice(0, basename.length - 1)
  : basename;

const plugins = [
  new webpack.EnvironmentPlugin({
    MOCK_STORE: null,
    BASENAME: '/',
  }),
  new webpack.DefinePlugin({
    // <-- key to reducing React's size
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'dev'),
      LOGOUT_INACTIVE_USERS: !(process.env.LOGOUT_INACTIVE_USERS === 'false'),
      WORKSPACE_TIMEOUT_IN_MINUTES:
        process.env.WORKSPACE_TIMEOUT_IN_MINUTES || 480,
      REACT_APP_PROJECT_ID: JSON.stringify(
        process.env.REACT_APP_PROJECT_ID || 'search'
      ),
      REACT_APP_DISABLE_SOCKET: JSON.stringify(
        process.env.REACT_APP_DISABLE_SOCKET || 'true'
      ),
    },
  }),
  new HtmlWebpackPlugin({
    title: process.env.TITLE || 'PCDC Data Portal',
    basename: pathPrefix,
    template: 'src/index.ejs',
    connect_src: (() => {
      const rv = {};
      if (typeof process.env.FENCE_URL !== 'undefined') {
        rv[new URL(process.env.FENCE_URL).origin] = true;
      }
      if (typeof process.env.INDEXD_URL !== 'undefined') {
        rv[new URL(process.env.INDEXD_URL).origin] = true;
      }
      if (typeof process.env.WORKSPACE_URL !== 'undefined') {
        rv[new URL(process.env.WORKSPACE_URL).origin] = true;
      }
      if (typeof process.env.WTS_URL !== 'undefined') {
        rv[new URL(process.env.WTS_URL).origin] = true;
      }
      if (typeof process.env.MANIFEST_SERVICE_URL !== 'undefined') {
        rv[new URL(process.env.MANIFEST_SERVICE_URL).origin] = true;
      }
      return Object.keys(rv).join(' ');
    })(),
    hash: true,
  }),
  new webpack.optimize.AggressiveMergingPlugin(), // Merge chunks
];

let optimization = {};
let devtool = false;

const isProduction =
  process.env.NODE_ENV !== 'dev' && process.env.NODE_ENV !== 'auto';
if (isProduction) {
  // optimization for production mode
  optimization = {
    splitChunks: {
      chunks: 'all',
    },
  };
} else {
  // add sourcemap tools for development mode
  devtool = 'eval-source-map';
}

module.exports = {
  entry: './src/index.jsx',
  target: 'web',
  bail: isProduction,
  externals: [
    nodeExternals({
      allowlist: ['graphiql', 'graphql-language-service-parser'],
    }),
  ],
  mode: isProduction ? 'production' : 'development',
  output: {
    path: __dirname,
    filename: isProduction
      ? '[name].[contenthash].bundle.js'
      : '[name].bundle.js',
    publicPath: isProduction ? basename : 'https://localhost:9443/',
  },
  optimization,
  devtool,
  devServer: {
    historyApiFallback: {
      index: 'dev.html',
    },
    disableHostCheck: true,
    compress: true,
    hot: true,
    port: 9443,
    https: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!(graphiql|graphql-language-service-parser)\/).*/,
        loader: 'babel-loader',
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.svg$/,
        use: ['babel-loader', 'react-svg-loader'],
      },
      {
        test: /\.(png|jpg|gif|woff|ttf|eot|woff2)$/,
        type: 'asset/inline',
      },
      {
        test: /\.flow$/,
        loader: 'ignore-loader',
      },
    ],
  },
  resolve: {
    alias: {
      graphql: path.resolve('./node_modules/graphql'),
      react: path.resolve('./node_modules/react'), // Same issue.
      graphiql: path.resolve('./node_modules/graphiql'),
      'graphql-language-service-parser': path.resolve(
        './node_modules/graphql-language-service-parser'
      ),
    },
    extensions: ['.mjs', '.js', '.jsx', '.json'],
  },
  plugins,
  externals: [
    {
      xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}',
    },
  ],
};
