import * as path from "path";
import * as os from "os";

import pLimit from "p-limit";

import { validate } from "schema-utils";
import serialize from "serialize-javascript";

import minifyFn from "./minify";
import schema from "./plugin-options.json";
import imageminMinify, {
  normalizeImageminConfig,
} from "./utils/imageminMinify";
import squooshMinify from "./utils/squooshMinify";

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("webpack").AssetInfo} AssetInfo */
/** @typedef {import("imagemin").Options} ImageminOptions */
/** @typedef {import("./loader").LoaderOptions} LoaderOptions */
/** @typedef {import("./utils/imageminMinify").default} ImageminMinifyFunction */
/** @typedef {import("./utils/squooshMinify").default} SquooshMinifyFunction */

/** @typedef {RegExp | string} Rule */

/** @typedef {Rule[] | Rule} Rules */

/**
 * @callback FilterFn
 * @param {Buffer} source `Buffer` of source file.
 * @param {string} sourcePath Absolute path to source.
 * @returns {boolean}
 */

/**
 * @typedef {Record.<string, Buffer>} DataForMinifyFn
 */

/**
 * @typedef {Object} ImageminMinimizerOptions
 * @property {ImageminOptions["plugins"] | [string, Record<string, any>]} plugins
 * @property {Array<Record<string, any>>} [pluginsMeta]
 */

/**
 * @typedef {Object} SquooshMinimizerOptions
 * @property {Object.<string, string>} [targets]
 * @property {Object.<string, object>} [encodeOptions]
 */

/**
 * @typedef {Record<string, any>} CustomFnMinimizerOptions
 */

/**
 * @typedef {ImageminMinimizerOptions | SquooshMinimizerOptions | CustomFnMinimizerOptions} MinimizerOptions
 */

/**
 * @typedef {Object} InternalMinifyOptions
 * @property {string} filename
 * @property {Buffer} input
 * @property {string} [severityError]
 * @property {MinimizerOptions} [minimizerOptions]
 * @property {MinifyFunctions} minify
 */

/**
 * @typedef {Object} InternalMinifyResult
 * @property {Buffer} data
 * @property {string} filename
 * @property {Array<Error>} warnings
 * @property {Array<Error>} errors
 */

/**
 * @callback CustomMinifyFunction
 * @param {DataForMinifyFn} data
 * @param {CustomFnMinimizerOptions} minifyOptions
 * @returns {InternalMinifyResult}
 */

/**
 * @typedef {ImageminMinifyFunction | SquooshMinifyFunction | CustomMinifyFunction} MinifyFunctions
 */

/**
 * @typedef {Object} MinifyFnResult
 * @property {string} filename
 * @property {Buffer} data
 * @property {Array<Error>} warnings
 * @property {Array<Error>} errors
 * @property {string} [type]
 */

/**
 * @typedef {Object} InternalLoaderOptions
 * @property {Rules} [test] Test to match files against.
 * @property {Rules} [include] Files to include.
 * @property {Rules} [exclude] Files to exclude.
 * @property {string} [loader]
 * @property {LoaderOptions} [loaderOptions]
 */

/**
 * @typedef {Object} PathData
 * @property {string} [filename]
 */

/**
 * @callback FilenameFn
 * @param {PathData} pathData
 * @param {AssetInfo} [assetInfo]
 * @returns {string}
 */

/**
 * @typedef {Object} PluginOptions
 * @property {FilterFn} [filter] Allows filtering of images for optimization.
 * @property {Rules} [test] Test to match files against.
 * @property {Rules} [include] Files to include.
 * @property {Rules} [exclude] Files to exclude.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {MinimizerOptions} [minimizerOptions] Options for `imagemin`.
 * @property {boolean} [loader] Automatically adding `imagemin-loader`.
 * @property {number} [maxConcurrency] Maximum number of concurrency optimization processes in one time.
 * @property {string | FilenameFn} [filename] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {boolean} [deleteOriginalAssets] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
 * @property {MinifyFunctions} [minify]
 */

/**
 * @extends {WebpackPluginInstance}
 */
class ImageMinimizerPlugin {
  /**
   * @param {PluginOptions} [options={}] Plugin options.
   */
  constructor(options = {}) {
    validate(/** @type {Schema} */ (schema), options, {
      name: "Image Minimizer Plugin",
      baseDataPath: "options",
    });

    const {
      minify = imageminMinify,
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
      filename = "[path][name][ext]",
      deleteOriginalAssets = false,
    } = options;

    this.options = {
      minify,
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
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {Set<string>} moduleAssets
   * @returns {Promise<void>}
   */
  async optimize(compiler, compilation, assets, moduleAssets) {
    const cache = compilation.getCache("ImageMinimizerWebpackPlugin");
    const assetsForMinify = await Promise.all(
      Object.keys(assets)
        .filter((name) => {
          const { info, source } = /** @type {Asset} */ (
            compilation.getAsset(name)
          );

          // Skip double minimize assets from child compilation
          if (info.minimized) {
            return false;
          }

          if (
            !compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
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

          if (
            this.options.filter &&
            !this.options.filter(/** @type {Buffer} */ (input), name)
          ) {
            return false;
          }

          return true;
        })
        .map(async (name) => {
          const { info, source } = /** @type {Asset} */ (
            compilation.getAsset(name)
          );

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

            const { severityError, minimizerOptions, minify } = this.options;

            const minifyOptions = /** @type {InternalMinifyOptions} */ ({
              filename: name,
              input,
              severityError,
              minimizerOptions,
              minify,
            });

            output = await minifyFn(minifyOptions);

            if (output.errors.length > 0) {
              /** @type {[WebpackError]} */
              (output.errors).forEach((error) => {
                compilation.errors.push(error);
              });

              return;
            }

            output.source = new RawSource(output.data);

            await cacheItem.storePromise({
              source: output.source,
              warnings: output.warnings,
            });
          }

          const { source, warnings } = output;

          if (warnings && warnings.length > 0) {
            /** @type {[WebpackError]} */
            (warnings).forEach((warning) => {
              compilation.warnings.push(warning);
            });
          }

          const { path: newName } = compilation.getPathWithInfo(
            this.options.filename,
            {
              filename: name,
            }
          );

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

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
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
          minify,
          filename,
          deleteOriginalAssets,
          filter,
          test,
          include,
          exclude,
          severityError,
          minimizerOptions,
        } = this.options;

        const loader = /** @type {InternalLoaderOptions} */ ({
          test,
          include,
          exclude,
          enforce: "pre",
          loader: require.resolve(path.join(__dirname, "loader.js")),
          options: {
            minify,
            filename,
            deleteOriginalAssets,
            severityError,
            filter,
            minimizerOptions,
          },
        });

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

ImageMinimizerPlugin.loader = require.resolve("./loader");

ImageMinimizerPlugin.normalizeImageminConfig = normalizeImageminConfig;
ImageMinimizerPlugin.imageminMinify = imageminMinify;
ImageMinimizerPlugin.squooshMinify = squooshMinify;

export default ImageMinimizerPlugin;
