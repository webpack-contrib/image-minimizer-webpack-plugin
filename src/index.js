import path from 'path';

import os from 'os';

import crypto from 'crypto';

import pLimit from 'p-limit';

import webpack from 'webpack';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';

import validateOptions from 'schema-utils';

import minify from './minify';
import interpolateName from './utils/interpolate-name';
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
      test = /\.(jpe?g|png|gif|tif|webp|svg|avif)$/i,
      include,
      exclude,
      severityError,
      minimizerOptions = {
        plugins: [],
      },
      loader = true,
      maxConcurrency,
      filename = '[path][name][ext]',
      deleteOriginalAssets = false,
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
      deleteOriginalAssets,
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
    const assetNames = Object.keys(assets).filter((name) => {
      if (
        // eslint-disable-next-line no-undefined
        !ModuleFilenameHelpers.matchObject.bind(undefined, this.options)(name)
      ) {
        return false;
      }

      // Exclude already optimized assets from `image-minimizer-webpack-loader`
      if (this.options.loader && moduleAssets.has(name)) {
        return false;
      }

      return true;
    });

    if (assetNames.length === 0) {
      return Promise.resolve();
    }

    const cpus = os.cpus() || { length: 1 };
    const limit = pLimit(
      this.options.maxConcurrency || Math.max(1, cpus.length - 1)
    );
    const scheduledTasks = [];
    const cache = new CacheEngine(
      compilation,
      {
        cache: this.options.cache,
      },
      weakCache
    );

    for (const name of assetNames) {
      scheduledTasks.push(
        limit(async () => {
          const { source: inputSource, info } = ImageMinimizerPlugin.getAsset(
            compilation,
            name
          );

          if (info.minimized) {
            return;
          }

          let input = inputSource.source();

          if (!Buffer.isBuffer(input)) {
            input = Buffer.from(input);
          }

          if (this.options.filter && !this.options.filter(input, name)) {
            return;
          }

          const cacheData = { inputSource };

          if (ImageMinimizerPlugin.isWebpack4()) {
            cacheData.cacheKeys = {
              // eslint-disable-next-line global-require
              'image-minimizer-webpack-plugin': require('../package.json')
                .version,
              'image-minimizer-webpack-plugin-options': this.options,
              name,
              contentHash: crypto.createHash('md4').update(input).digest('hex'),
            };
          } else {
            cacheData.name = name;
          }

          let output = await cache.get(cacheData, { RawSource });

          if (!output) {
            const {
              severityError,
              isProductionMode,
              minimizerOptions,
            } = this.options;

            const minifyOptions = {
              filename: name,
              input,
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

            output.source = new RawSource(output.output);

            await cache.store({ ...output, ...cacheData });
          }

          const { source, warnings } = output;

          if (warnings && warnings.length > 0) {
            warnings.forEach((warning) => {
              compilation.warnings.push(warning);
            });
          }

          const newName = interpolateName(name, this.options.filename);

          const isNewAsset = name !== newName;

          if (isNewAsset) {
            // TODO `...` required only for webpack@4
            const newInfo = {
              related: { minimized: newName, ...info.related },
              minimized: true,
            };

            ImageMinimizerPlugin.emitAsset(
              compilation,
              newName,
              source,
              newInfo
            );

            if (this.options.deleteOriginalAssets) {
              ImageMinimizerPlugin.deleteAsset(compilation, name);
            }
          } else {
            // TODO `...` required only for webpack@4
            const newOriginalInfo = {
              ...info,
              minimized: true,
            };

            ImageMinimizerPlugin.updateAsset(
              compilation,
              name,
              source,
              newOriginalInfo
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
          deleteOriginalAssets,
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
            deleteOriginalAssets,
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
