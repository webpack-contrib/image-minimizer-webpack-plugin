import path from 'path';

import os from 'os';

import pLimit from 'p-limit';

import webpack from 'webpack';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';

import { validate } from 'schema-utils';
import serialize from 'serialize-javascript';

import minify from './minify';
import interpolateName from './utils/interpolate-name';
import schema from './plugin-options.json';

const { RawSource } =
  // eslint-disable-next-line global-require
  webpack.sources || require('webpack-sources');

class ImageMinimizerPlugin {
  constructor(options = {}) {
    validate(schema, options, {
      name: 'Image Minimizer Plugin',
      baseDataPath: 'options',
    });

    const {
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

  async optimize(compiler, compilation, assets, moduleAssets) {
    const cache = compilation.getCache('ImageMinimizerWebpackPlugin');
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

    for (const name of assetNames) {
      scheduledTasks.push(
        limit(async () => {
          const { source: inputSource, info } = compilation.getAsset(name);

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

          const cacheName = serialize({
            name,
            minimizerOptions: this.options.minimizerOptions,
          });

          const eTag = cache.getLazyHashedEtag(inputSource);
          const cacheItem = cache.getItemCache(cacheName, eTag);
          let output = await cacheItem.getPromise();

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

            await cacheItem.storePromise({
              source: output.source,
              warnings: output.warnings,
            });
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

            compilation.emitAsset(newName, source, newInfo);

            if (this.options.deleteOriginalAssets) {
              compilation.deleteAsset(name);
            }
          } else {
            // TODO `...` required only for webpack@4
            const newOriginalInfo = {
              ...info,
              minimized: true,
            };

            compilation.updateAsset(name, source, newOriginalInfo);
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
            filter,
            minimizerOptions,
          },
        };

        compiler.options.module.rules.push(loader);
      });
    }

    // eslint-disable-next-line global-require
    const Compilation = require('webpack/lib/Compilation');

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        (assets) => this.optimize(compiler, compilation, assets, moduleAssets)
      );
    });
  }
}

ImageMinimizerPlugin.loader = require.resolve('./loader');

ImageMinimizerPlugin.normalizeConfig = require('./utils/normalize-config').default;

export default ImageMinimizerPlugin;
