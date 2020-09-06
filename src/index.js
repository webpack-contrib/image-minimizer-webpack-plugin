import path from 'path';

import os from 'os';

import crypto from 'crypto';

import pLimit from 'p-limit';

import webpack from 'webpack';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';
import loaderUtils from 'loader-utils';

import validateOptions from 'schema-utils';

import minify from './minify';
import schema from './plugin-options.json';

const { RawSource } =
  // eslint-disable-next-line global-require
  webpack.sources || require('webpack-sources');

class ImageMinimizerPlugin {
  constructor(options = {}) {
    validateOptions(schema, options, {
      name: 'Image Minimizer Plugin',
      baseDataPath: 'options',
    });

    const {
      cache = false,
      filter = () => true,
      test = /\.(jpe?g|png|gif|tif|webp|svg)$/i,
      include,
      exclude,
      severityError,
      minimizerOptions = {
        plugins: [],
      },
      loader = true,
      maxConcurrency,
      filename,
      keepOriginal,
    } = options;

    this.options = {
      severityError,
      cache,
      filter,
      exclude,
      minimizerOptions,
      include,
      loader,
      maxConcurrency,
      test,
      filename,
      keepOriginal,
    };
  }

  static isWebpack4() {
    return webpack.version[0] === '4';
  }

  // eslint-disable-next-line consistent-return
  static getAsset(compilation, name) {
    // New API
    if (compilation.getAsset) {
      return compilation.getAsset(name);
    }

    if (compilation.assets[name]) {
      return { name, source: compilation.assets[name], info: {} };
    }
  }

  static updateAsset(compilation, name, newSource, assetInfo) {
    // New API
    if (compilation.updateAsset) {
      compilation.updateAsset(name, newSource, assetInfo);
    }

    // eslint-disable-next-line no-param-reassign
    compilation.assets[name] = newSource;
  }

  static emitAsset(compilation, name, source, assetInfo) {
    // New API
    if (compilation.emitAsset) {
      compilation.emitAsset(name, source, assetInfo);
    }

    // eslint-disable-next-line no-param-reassign
    compilation.assets[name] = source;
  }

  static deleteAsset(compilation, name) {
    // New API
    if (compilation.deleteAsset) {
      compilation.deleteAsset(name);
    }

    // eslint-disable-next-line no-param-reassign
    delete compilation.assets[name];
  }

  async optimize(
    compiler,
    compilation,
    assets,
    moduleAssets,
    CacheEngine,
    weakCache
  ) {
    const matchObject = ModuleFilenameHelpers.matchObject.bind(
      // eslint-disable-next-line no-undefined
      undefined,
      this.options
    );

    const assetNames = Object.keys(assets).filter((assetName) => {
      if (!matchObject(assetName)) {
        return false;
      }

      // Exclude already optimized assets from `image-minimizer-webpack-loader`
      if (this.options.loader && moduleAssets.has(assetName)) {
        return false;
      }

      return true;
    });

    if (assetNames.length === 0) {
      return Promise.resolve();
    }

    const cache = new CacheEngine(
      compilation,
      {
        cache: this.options.cache,
      },
      weakCache
    );

    const cpus = os.cpus() || { length: 1 };
    const limit = pLimit(
      this.options.maxConcurrency || Math.max(1, cpus.length - 1)
    );
    const scheduledTasks = [];

    for (const assetName of assetNames) {
      scheduledTasks.push(
        limit(async () => {
          const { source: assetSource, info } = ImageMinimizerPlugin.getAsset(
            compilation,
            assetName
          );

          if (info.minimized) {
            return;
          }

          if (
            this.options.filter &&
            !this.options.filter(assetSource.source(), assetName)
          ) {
            return;
          }

          const cacheData = {
            source: assetSource,
            filename: assetName,
          };

          if (ImageMinimizerPlugin.isWebpack4()) {
            if (this.options.cache) {
              cacheData.cacheKeys = {
                nodeVersion: process.version,
                // eslint-disable-next-line global-require
                'image-minimizer-webpack-plugin': require('../package.json')
                  .version,
                'image-minimizer-webpack-plugin-options': this.options,
                assetName,
                contentHash: crypto
                  .createHash('md4')
                  .update(assetSource.source())
                  .digest('hex'),
              };
            }
          }

          let output = await cache.get(cacheData, { RawSource });

          if (!output) {
            const {
              severityError,
              isProductionMode,
              minimizerOptions,
            } = this.options;

            const minifyOptions = {
              input: assetSource.source(),
              filename: assetName,
              severityError,
              isProductionMode,
              minimizerOptions,
            };

            output = await minify(minifyOptions);

            if (output.errors.length > 0) {
              output.errors.forEach((error) => {
                compilation.errors.push(error);
              });

              return;
            }

            if (output.compressed && !output.compressed.source) {
              output.compressed = new RawSource(output.compressed);
            }

            await cache.store({ ...output, ...cacheData });
          }

          const { compressed, filename, warnings } = output;

          if (warnings && warnings.length > 0) {
            warnings.forEach((warning) => {
              compilation.warnings.push(warning);
            });
          }

          if (this.options.filename) {
            const newFilename = loaderUtils.interpolateName(
              { resourcePath: filename },
              this.options.filename,
              {
                content: compressed.toString(),
              }
            );

            if (!this.options.keepOriginal) {
              ImageMinimizerPlugin.deleteAsset(compilation, filename);
            }

            ImageMinimizerPlugin.emitAsset(
              compilation,
              newFilename,
              compressed,
              { minimized: true }
            );
          } else {
            ImageMinimizerPlugin.updateAsset(
              compilation,
              filename,
              compressed,
              {
                minimized: true,
              }
            );
          }
        })
      );
    }

    return Promise.all(scheduledTasks);
  }

  apply(compiler) {
    this.options.isProductionMode =
      compiler.options.mode === 'production' || !compiler.options.mode;

    const pluginName = this.constructor.name;

    const moduleAssets = new Set();

    if (this.options.loader) {
      // Collect assets from modules
      compiler.hooks.compilation.tap({ name: pluginName }, (compilation) => {
        compilation.hooks.moduleAsset.tap(
          { name: pluginName },
          (module, file) => {
            moduleAssets.add(file);
          }
        );
      });

      compiler.hooks.afterPlugins.tap({ name: pluginName }, () => {
        const {
          filename,
          keepOriginal,
          cache,
          filter,
          test,
          include,
          exclude,
          severityError,
          minimizerOptions,
        } = this.options;

        const loader = {
          test,
          include,
          exclude,
          enforce: 'pre',
          loader: path.join(__dirname, 'loader.js'),
          options: {
            filename,
            keepOriginal,
            severityError,
            cache,
            filter,
            minimizerOptions,
          },
        };

        compiler.options.module.rules.push(loader);
      });
    }

    const weakCache = new WeakMap();

    if (ImageMinimizerPlugin.isWebpack4()) {
      // eslint-disable-next-line global-require
      const CacheEngine = require('./Webpack4Cache').default;

      compiler.hooks.emit.tapPromise({ name: pluginName }, (compilation) =>
        this.optimize(
          compiler,
          compilation,
          compilation.assets,
          moduleAssets,
          CacheEngine,
          weakCache
        )
      );
    } else {
      // eslint-disable-next-line global-require
      const CacheEngine = require('./Webpack5Cache').default;

      // eslint-disable-next-line global-require
      const Compilation = require('webpack/lib/Compilation');

      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: pluginName,
            stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          },
          (assets) =>
            this.optimize(
              compiler,
              compilation,
              assets,
              moduleAssets,
              CacheEngine,
              weakCache
            )
        );
      });
    }
  }
}

ImageMinimizerPlugin.loader = require.resolve('./loader');

ImageMinimizerPlugin.normalizeConfig = require('./utils/normalize-config').default;

export default ImageMinimizerPlugin;
