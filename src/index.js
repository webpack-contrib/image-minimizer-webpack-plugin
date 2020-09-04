import path from 'path';

import os from 'os';

import crypto from 'crypto';

import pLimit from 'p-limit';

import webpack from 'webpack';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';

import validateOptions from 'schema-utils';

import minify from './minify';
import schema from './plugin-options.json';
import { runImagemin } from './utils';

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
          const { source, info } = ImageMinimizerPlugin.getAsset(
            compilation,
            assetName
          );

          if (info.minimized) {
            return;
          }

          if (
            this.options.filter &&
            !this.options.filter(source.source(), assetName)
          ) {
            return;
          }

          const cacheData = {
            source,
            input: source.source(),
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
                  .update(cacheData.input)
                  .digest('hex'),
              };
            }
          }

          let result = await cache.get(cacheData, { RawSource });

          if (!result) {
            const {
              severityError,
              isProductionMode,
              minimizerOptions,
              maxConcurrency,
            } = this.options;

            const minifyOptions = {
              severityError,
              isProductionMode,
              cache: this.options.cache,
              minimizerOptions,
              maxConcurrency,
            };

            result = await minify(cacheData, minifyOptions);

            if (!result.output.source) {
              result.output = new RawSource(result.output);
            }

            if (result.warnings.length === 0 && result.errors.length === 0) {
              await cache.store({ ...result, ...cacheData });
            }
          }

          const { output, filename, warnings, errors } = result;

          if (warnings && warnings.length > 0) {
            warnings.forEach((warning) => {
              compilation.warnings.push(warning);
            });
          }

          if (errors && errors.length > 0) {
            errors.forEach((warning) => {
              compilation.errors.push(warning);
            });
          }

          ImageMinimizerPlugin.updateAsset(compilation, filename, output, {
            minimized: true,
          });
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
