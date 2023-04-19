/**
 * Base webpack config used across other specific configs for web
 */
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { dependencies as externals } from '../redisinsight/package.json';
import { dependencies as externalsApi } from '../redisinsight/api/package.json';

export default {
  target: 'web',

  externals: [...Object.keys(externals || {}), ...Object.keys(externalsApi || {})],

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        // exclude: /node_modules/,
        include: [path.resolve(__dirname, '../redisinsight/ui')],
        exclude: [
          /node_modules/,
          path.resolve(__dirname, '../menu.ts'),
          path.resolve(__dirname, 'menu.ts'),
          path.resolve(__dirname, '../Menu.ts'),
          path.resolve(__dirname, 'Menu.ts'),
          path.resolve(__dirname, '../redisinsight/main.dev.ts'),
          path.resolve(__dirname, '../redisinsight/api'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },

  // context: path.resolve(__dirname, '../redisinsight/api/src'),
  context: path.resolve(__dirname, '../redisinsight/ui'),

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, '..', 'tsconfig.json'),
      }),
    ],
    fallback: {
      os: false,
    },

    modules: ['node_modules', path.join(__dirname, '../node_modules')],
  },

  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html.ejs' }),

    new MonacoWebpackPlugin({ languages: ['json'], features: ['!rename'] }),

    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/platform-express',
          'pnpapi',
          'stream',
          'os',
          'os-browserify',
          'cache-manager',
          'class-validator',
          'class-transformer',
          'fastify-static',
          'fastify-swagger',
          'reflect-metadata',
          'swagger-ui-express',
          'class-transformer/storage',
          // '@nestjs/websockets',
          '@nestjs/microservices/microservices-module',
          // '@nestjs/websockets/socket-module',
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
  ],
};
