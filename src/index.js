import * as path from 'path';
import * as os from 'os';

import pLimit from 'p-limit';

import { validate } from 'schema-utils';
import serialize from 'serialize-javascript';

import minify from './minify';
import interpolateName from './utils/interpolate-name';
import schema from './plugin-options.json';

/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */

/**
 * @callback Filter
 * @param {Buffer} source `Buffer` of source file.
 * @param {string} sourcePath Absolute path to source.
 * @returns {boolean}
 */

/**
 * @typedef {Object} PluginOptions
 * @property {Filter} [filter=() => true] Allows filtering of images for optimization.
 * @property {string|RegExp|Array<string|RegExp>} [test=/\.(jpe?g|png|gif|tif|webp|svg|avif)$/i] Test to match files against.
 * @property {string|RegExp|Array<string|RegExp>} [include] Files to include.
 * @property {string|RegExp|Array<string|RegExp>} [exclude] Files to exclude.
 * @property {boolean|string} [severityError='auto'] Allows to choose how errors are displayed.
 * @property {Object} [minimizerOptions={plugins: []}] Options for `imagemin`.
 * @property {boolean} [loader=true] Automatically adding `imagemin-loader`.
 * @property {number} [maxConcurrency=Math.max(1, os.cpus().length - 1)] Maximum number of concurrency optimization processes in one time.
 * @property {string} [filename='[path][name][ext]'] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {boolean} [deleteOriginalAssets=false] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
 */

/**
 * @extends {WebpackPluginInstance}
 */
class ImageMinimizerPlugin {
  /**
   * @param {PluginOptions} [options={}] Plugin options.
   */
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

  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param assets
   * @param moduleAssets
   * @returns {Promise<void>}
   */
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
            let newAssetName;
            const updatedAssetsInfo = {
              minimized: true,
            };

            if (info.contenthash) {
              const { outputOptions } = compilation;
              const {
                hashDigest,
                hashDigestLength,
                hashFunction,
                hashSalt,
              } = outputOptions;
              const hash = compiler.webpack.util.createHash(hashFunction);

              if (hashSalt) {
                hash.update(hashSalt);
              }

              hash.update(source.source());

              const fullContentHash = hash.digest(hashDigest);

              updatedAssetsInfo.contenthash = fullContentHash.slice(
                0,
                hashDigestLength
              );

              const oldContentHash =
                typeof info.contenthash === 'string'
                  ? info.contenthash
                  : info.contenthash[0];
              const regExp = new RegExp(oldContentHash, 'gi');

              newAssetName = name.replace(
                regExp,
                updatedAssetsInfo.contenthash
              );
            }

            compilation.updateAsset(name, source, updatedAssetsInfo);

            if (newAssetName) {
              compilation.renameAsset(name, newAssetName);
            }
          }
        })
      );
    }

    await Promise.all(scheduledTasks);
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
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
          additionalAssets: true,
        },
        (assets) => this.optimize(compiler, compilation, assets, moduleAssets)
      );
    });
  }
}

ImageMinimizerPlugin.loader = require.resolve('./loader');

ImageMinimizerPlugin.normalizeConfig = require('./utils/normalize-config').default;

export default ImageMinimizerPlugin;
