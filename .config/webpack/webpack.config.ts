import type { Configuration } from 'webpack';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// @ts-ignore
import ReplaceInFileWebpackPlugin from 'replace-in-file-webpack-plugin';

const config = async (env: any): Promise<Configuration> => {
  const isProduction = env?.production;

  return {
    cache: false,
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    entry: {
      module: './src/module.ts',
    },
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: '[name].js',
      libraryTarget: 'amd',
      clean: true,
      devtoolModuleFilenameTemplate: (info: any) => {
        // Strip ./src/ prefix so Grafana plugin-validator resolves paths correctly.
        // The validator prepends its own src/ when looking up files in the repo.
        return info.resourcePath.replace(/^\.\/src\//, './');
      },
    },
    externals: [
      'lodash',
      'jquery',
      'moment',
      'slate',
      'prismjs',
      '@grafana/ui',
      '@grafana/runtime',
      '@grafana/data',
      function ({ request }, callback) {
        const prefix = 'grafana/';
        if (request && request.indexOf(prefix) === 0) {
          return callback(undefined, request.substr(prefix.length));
        }
        callback();
      },
    ],
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/plugin.json', to: '.' },
          { from: 'src/img/', to: 'img/', noErrorOnMissing: true },
          { from: 'README.md', to: '.' },
          { from: 'LICENSE', to: '.' },
          { from: 'CHANGELOG.md', to: '.', noErrorOnMissing: true },
        ],
      }),
      new ForkTsCheckerWebpackPlugin({
        async: isProduction ? false : true,
        issue: {
          include: [{ file: '**/*.{ts,tsx}' }],
        },
        typescript: { configFile: path.join(process.cwd(), 'tsconfig.json') },
      }),
      new ReplaceInFileWebpackPlugin([
        {
          dir: 'dist',
          files: ['plugin.json'],
          rules: [
            {
              search: '%VERSION%',
              replace: process.env.npm_package_version || '1.0.0',
            },
            {
              search: '%TODAY%',
              replace: new Date().toISOString().substring(0, 10),
            },
          ],
        },
      ]),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
      alias: {
        src: path.resolve(process.cwd(), 'src/'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: false,
                  dynamicImport: true,
                },
              },
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};

export default config;