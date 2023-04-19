import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { toString } from 'lodash'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import baseConfig from './webpack.config.base';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';
import { version } from '../redisinsight/package.json';

DeleteSourceMaps();

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
        devtool: 'source-map',
      }
    : {};

export default merge(baseConfig, {
  ...devtoolsConfig,

  mode: 'development',

  target: 'electron-main',

  entry: './redisinsight/main.dev.ts',

  resolve: {
    alias: {
      ['apiSrc']: path.resolve(__dirname, '../redisinsight/api/src'),
      ['src']: path.resolve(__dirname, '../redisinsight/api/src'),
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },

  output: {
    path: path.join(__dirname, '../redisinsight'),
    filename: 'main.prod.js',
  },

  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       parallel: true,
  //     }),
  //   ],
  // },

  // alias: {
  //   'apiSrc': path.resolve(__dirname, '../redisinsight/api/src/')
  // },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      APP_ENV: 'electron',
      SERVER_TLS: true,
      SERVER_TLS_CERT: process.env.SERVER_TLS_CERT || '',
      SERVER_TLS_KEY: process.env.SERVER_TLS_KEY || '',
      APP_FOLDER_NAME: process.env.APP_FOLDER_NAME || '',
      UPGRADES_LINK: process.env.UPGRADES_LINK || '',
      BUILD_TYPE: 'ELECTRON',
      APP_VERSION: version,
      AWS_BUCKET_NAME: 'AWS_BUCKET_NAME' in process.env ? process.env.AWS_BUCKET_NAME : '',
      SEGMENT_WRITE_KEY: 'SEGMENT_WRITE_KEY' in process.env ? process.env.SEGMENT_WRITE_KEY : 'SOURCE_WRITE_KEY',
      CONNECTIONS_TIMEOUT_DEFAULT: 'CONNECTIONS_TIMEOUT_DEFAULT' in process.env
        ? process.env.CONNECTIONS_TIMEOUT_DEFAULT
        : toString(30 * 1000), // 30 sec
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
});
