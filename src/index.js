import path from 'path';

import crypto from 'crypto';

import webpack from 'webpack';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';

import validateOptions from 'schema-utils';

import minify from './minify';
import schema from './plugin-options.json';

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
      bail = null,
      minimizerOptions = {
        plugins: [],
      },
      loader = true,
      maxConcurrency,
    } = options;

    this.options = {
      bail,
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

  async runTasks(
    compiler,
    compilation,
    assetNames,
    moduleAssets,
    CacheEngine,
    weakCache
  ) {
    const { bail, filter, minimizerOptions, maxConcurrency } = this.options;
    const cache = new CacheEngine(
      compilation,
      {
        cache: this.options.cache,
      },
      weakCache
    );

    let results;

    const tasks = assetNames.filter((assetName) => {
      const { info: assetInfo } = ImageMinimizerPlugin.getAsset(
        compilation,
        assetName
      );

      if (assetInfo.minimized) {
        return false;
      }

      return true;
    });

    try {
      results = await minify(
        tasks.map((assetName) => {
          const task = {
            source: compilation.getAsset(assetName).source,
            input: compilation.getAsset(assetName).source.source(),
            filename: assetName,
          };

          if (ImageMinimizerPlugin.isWebpack4()) {
            if (this.options.cache) {
              task.cacheKeys = {
                nodeVersion: process.version,
                // eslint-disable-next-line global-require
                'image-minimizer-webpack-plugin': require('../package.json')
                  .version,
                'image-minimizer-webpack-plugin-options': this.options,
                assetName,
                contentHash: crypto
                  .createHash('md4')
                  .update(task.input)
                  .digest('hex'),
              };
            }
          }

          return task;
        }),
        {
          bail,
          filter,
          cache: this.options.cache,
          minimizerOptions,
          maxConcurrency,
        },
        cache
      );
    } catch (error) {
      return Promise.reject(error);
    }

    results.forEach((result) => {
      const { filtered, output, filename, warnings, errors } = result;

      if (filtered) {
        return;
      }

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
    });

    return Promise.resolve();
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    if (typeof this.options.bail !== 'boolean') {
      this.options.bail = compiler.options.bail;
    }

    const matchObject = ModuleFilenameHelpers.matchObject.bind(
      // eslint-disable-next-line no-undefined
      undefined,
      this.options
    );

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
          bail,
          minimizerOptions,
        } = this.options;

        const loader = {
          test,
          include,
          exclude,
          enforce: 'pre',
          loader: path.join(__dirname, 'loader.js'),
          options: {
            bail,
            cache,
            filter,
            minimizerOptions,
          },
        };

        compiler.options.module.rules.push(loader);
      });
    }

    const weakCache = new WeakMap();

    const optimizeFn = async (compilation, CacheEngine, assets) => {
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

      await this.runTasks(
        compiler,
        compilation,
        assetNames,
        moduleAssets,
        CacheEngine,
        weakCache
      );

      return Promise.resolve();
    };

    if (ImageMinimizerPlugin.isWebpack4()) {
      // eslint-disable-next-line global-require
      const CacheEngine = require('./Webpack4Cache').default;

      compiler.hooks.emit.tapPromise({ name: pluginName }, (compilation) =>
        optimizeFn(compilation, CacheEngine, compilation.assets)
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
          (assets) => optimizeFn(compilation, CacheEngine, assets)
        );
      });
    }
  }
}

ImageMinimizerPlugin.loader = require.resolve('./loader');

ImageMinimizerPlugin.normalizeConfig = require('./utils/normalize-config').default;

export default ImageMinimizerPlugin;
