import path from 'path';

import os from 'os';

import pLimit from 'p-limit';

import { validate } from 'schema-utils';
import serialize from 'serialize-javascript';

import minify from './minify';
import interpolateName from './utils/interpolate-name';
import schema from './plugin-options.json';

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
    const assetsForMinify = await Promise.all(
      Object.keys(assets)
        .filter((name) => {
          const { info, source } = compilation.getAsset(name);

          // Skip double minimize assets from child compilation
          if (info.minimized) {
            return false;
          }

          if (
            !compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
              // eslint-disable-next-line no-undefined
              undefined,
              this.options
            )(name)
          ) {
            return false;
          }

          // Exclude already optimized assets from `image-minimizer-webpack-loader`
          if (this.options.loader && moduleAssets.has(name)) {
            return false;
          }

          const input = source.source();

          if (this.options.filter && !this.options.filter(input, name)) {
            return false;
          }

          return true;
        })
        .map(async (name) => {
          const { info, source } = compilation.getAsset(name);

          const cacheName = serialize({
            name,
            minimizerOptions: this.options.minimizerOptions,
          });

          const eTag = cache.getLazyHashedEtag(source);
          const cacheItem = cache.getItemCache(cacheName, eTag);
          const output = await cacheItem.getPromise();

          return { name, info, inputSource: source, output, cacheItem };
        })
    );

    const cpus = os.cpus() || { length: 1 };
    const limit = pLimit(
      this.options.maxConcurrency || Math.max(1, cpus.length - 1)
    );

    const { RawSource } = compiler.webpack.sources;

    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(
        limit(async () => {
          const { name, inputSource, cacheItem, info } = asset;
          let { output } = asset;
          let input;

          const sourceFromInputSource = inputSource.source();

          if (!output) {
            input = sourceFromInputSource;

            if (!Buffer.isBuffer(input)) {
              input = Buffer.from(input);
            }

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
            const newInfo = {
              related: { minimized: newName, ...info.related },
              minimized: true,
            };

            compilation.emitAsset(newName, source, newInfo);

            if (this.options.deleteOriginalAssets) {
              compilation.deleteAsset(name);
            }
          } else {
            const updatedAssetsInfo = {
              minimized: true,
            };

            compilation.updateAsset(name, source, updatedAssetsInfo);
          }
        })
      );
    }

    await Promise.all(scheduledTasks);
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

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        (assets) => this.optimize(compiler, compilation, assets, moduleAssets)
      );
    });
  }
}

ImageMinimizerPlugin.loader = require.resolve('./loader');

ImageMinimizerPlugin.normalizeConfig = require('./utils/normalize-config').default;

export default ImageMinimizerPlugin;
