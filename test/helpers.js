import fs from 'fs';
import path from 'path';

import imagemin from 'imagemin';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import pify from 'pify';
import tempy from 'tempy';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

import ImageMinimizerPlugin from '../src/index';

import EmitPlugin from './fixtures/EmitWepbackPlugin';

const plugins = ['gifsicle', 'mozjpeg', 'pngquant', 'svgo'];

const fixturesPath = path.join(__dirname, './fixtures');

function compile(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      return resolve(stats);
    });
  });
}

function runWebpack(maybeOptions, getCompiler = false) {
  const maybeMultiCompiler = Array.isArray(maybeOptions)
    ? maybeOptions
    : [maybeOptions];

  const configs = [];

  maybeMultiCompiler.forEach((options) => {
    const config = {
      bail: options.bail,
      context: fixturesPath,
      entry: options.entry
        ? options.entry
        : path.join(fixturesPath, './loader.js'),
      mode: options.mode || 'development',
      optimization: options.optimization,
      cache: options.cache,
      module: {
        rules: []
          .concat(
            !options.fileLoaderOff
              ? {
                  test: options.test ? options.test : /\.(jpe?g|png|gif|svg)$/i,
                  use: [
                    {
                      loader: 'file-loader',
                      options: {
                        name: options.name
                          ? options.name
                          : '[path][name].[ext]',
                      },
                    },
                  ],
                }
              : []
          )
          .concat(
            options.MCEP
              ? {
                  test: /\.css$/,
                  use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                  ],
                }
              : []
          )
          .concat(
            options.childPlugin
              ? {
                  test: /child-compilation\.js$/,
                  loader: path.resolve(
                    __dirname,
                    './fixtures/emit-asset-in-child-compilation-loader.js'
                  ),
                }
              : []
          )
          .concat(
            options.emitAssetPlugin
              ? {
                  test: /simple-emit\.js$/,
                  loader: path.resolve(
                    __dirname,
                    './fixtures/emitAssetLoader.js'
                  ),
                }
              : []
          )
          .concat(
            options.assetResource
              ? {
                  test: /\.(jpe?g|png|gif|svg)$/i,
                  type: 'asset/resource',
                }
              : []
          )
          .concat(
            options.assetInline
              ? {
                  test: /\.(jpe?g|png|gif|svg)$/i,
                  type: 'asset/inline',
                }
              : []
          ),
      },
      output: {
        publicPath: '',
        filename: 'bundle.js',
        path:
          options.output && options.output.path
            ? options.output.path
            : tempy.directory(),
      },
      plugins: [],
    };

    if (options.experiments) {
      config.experiments = options.experiments;
    }

    if (options.output && options.output.assetModuleFilename) {
      config.output.assetModuleFilename = options.output.assetModuleFilename;
    }

    if (options.imageminLoader || options.imageminLoaderOptions) {
      config.module.rules[0].use = config.module.rules[0].use.concat({
        loader: ImageMinimizerPlugin.loader,
        options: options.imageminLoaderOptions
          ? options.imageminLoaderOptions
          : {
              minimizerOptions: { plugins },
            },
      });
    }

    if (options.emitPlugin || options.emitPluginOptions) {
      config.plugins = config.plugins.concat(
        new EmitPlugin(options.emitPluginOptions)
      );
    }

    if (options.imageminPlugin || options.imageminPluginOptions) {
      const imageminPluginsOptions =
        Array.isArray(options.imageminPlugin) ||
        Array.isArray(options.imageminPluginOptions)
          ? options.imageminPlugin || options.imageminPluginOptions
          : [options.imageminPlugin || options.imageminPluginOptions];

      imageminPluginsOptions.forEach((imageminPluginOptions) => {
        const ImageMinimizerPluginCreated = new ImageMinimizerPlugin(
          typeof imageminPluginOptions === 'boolean'
            ? {
                minimizerOptions: {
                  plugins,
                },
              }
            : imageminPluginOptions
        );

        if (options.asMinimizer) {
          if (!config.optimization) {
            config.optimization = {};
          }

          config.optimization.minimize = true;
          config.optimization.minimizer = [ImageMinimizerPluginCreated];
        } else {
          config.plugins = config.plugins.concat(ImageMinimizerPluginCreated);
        }
      });
    }

    if (options.MCEP) {
      config.plugins = config.plugins.concat(
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: '[name].css',
          chunkFilename: '[id].css',
        })
      );
    }

    if (options.copyPlugin) {
      config.plugins = config.plugins.concat(
        new CopyPlugin(
          options.copyPluginOptions || {
            patterns: [{ from: 'plugin-test.jpg' }],
          }
        )
      );
    }

    if (options.EmitNewAssetPlugin) {
      config.plugins = config.plugins.concat(
        // eslint-disable-next-line no-use-before-define
        new EmitNewAssetPlugin({
          name: 'newImg.png',
        })
      );
    }

    configs.push(config);
  });

  if (getCompiler) {
    return webpack(configs.length === 1 ? configs[0] : configs);
  }

  return pify(webpack)(configs.length === 1 ? configs[0] : configs);
}

function isOptimized(originalPath, compilation) {
  const { assets } = compilation;
  let name = originalPath;
  let realName = originalPath;

  if (Array.isArray(originalPath)) {
    [name, realName] = originalPath;
  }

  const source = assets[name];

  if (!source) {
    throw new Error("Can't find asset");
  }

  const { path: outputPath } = compilation.options.output;
  const pathToOriginal = path.join(fixturesPath, realName);
  const pathToEmitted = path.join(outputPath, name);

  return Promise.resolve()
    .then(() => pify(fs.readFile)(pathToOriginal))
    .then((data) =>
      imagemin.buffer(data, {
        plugins: [
          imageminGifsicle(),
          imageminMozjpeg(),
          imageminPngquant(),
          imageminSvgo(),
        ],
      })
    )
    .then((optimizedBuffer) =>
      Promise.resolve()
        .then(() => pify(fs.readFile)(pathToEmitted))
        .then((emmitedBuffer) => optimizedBuffer.equals(emmitedBuffer))
    );
}

function hasLoader(id, modules) {
  return [...modules].some((module) => {
    if (!module.id.endsWith(id)) {
      return false;
    }

    const { loaders } = module;

    return loaders.find(
      (loader) => loader.loader === ImageMinimizerPlugin.loader
    );
  });
}

function readAsset(asset, compiler, stats) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;

  let data = '';
  let targetFile = asset;

  const queryStringIdx = targetFile.indexOf('?');

  if (queryStringIdx >= 0) {
    targetFile = targetFile.substr(0, queryStringIdx);
  }

  try {
    data = usedFs.readFileSync(path.join(outputPath, targetFile));
  } catch (error) {
    data = error.toString();
  }

  return data;
}

function normalizePath(string) {
  const isWin = process.platform === 'win32';

  if (isWin) {
    return string.replace(/\\/g, '/');
  }

  return string;
}

function clearDirectory(dirPath) {
  let files;

  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const filePath = `${dirPath}/${files[i]}`;

      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        clearDirectory(filePath);
      }
    }
  }

  fs.rmdirSync(dirPath);
}

export default class EmitNewAssetPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    const { RawSource } = compiler.webpack.sources;

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const file = fs.readFileSync(
            path.resolve(__dirname, 'fixtures', 'newImg.png')
          );

          // eslint-disable-next-line no-param-reassign
          compilation.emitAsset(this.options.name, new RawSource(file));
        }
      );
    });
  }
}

export {
  runWebpack as webpack,
  compile,
  isOptimized,
  plugins,
  fixturesPath,
  hasLoader,
  readAsset,
  normalizePath,
  clearDirectory,
  EmitNewAssetPlugin,
};
