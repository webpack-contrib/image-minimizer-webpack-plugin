import * as path from "path";
import * as os from "os";

import { validate } from "schema-utils";
import serialize from "serialize-javascript";

import worker from "./worker";
import schema from "./plugin-options.json";
import {
  throttleAll,
  imageminNormalizeConfig,
  imageminMinify,
  imageminGenerate,
  squooshMinify,
  squooshGenerate,
} from "./utils.js";

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("webpack").AssetInfo} AssetInfo */
/** @typedef {import("imagemin").Options} ImageminOptions */
/** @typedef {import("./loader").LoaderOptions} LoaderOptions */
/** @typedef {import("./utils.js").imageminMinify} ImageminMinifyFunction */
/** @typedef {import("./utils.js").squooshMinify} SquooshMinifyFunction */

/** @typedef {RegExp | string} Rule */

/** @typedef {Rule[] | Rule} Rules */

/**
 * @callback FilterFn
 * @param {Buffer} source `Buffer` of source file.
 * @param {string} sourcePath Absolute path to source.
 * @returns {boolean}
 */

/**
 * @typedef {Object} ImageminMinimizerOptions
 * @property {ImageminOptions["plugins"] | [string, Record<string, any>]} plugins
 * @property {Array<Record<string, any>>} [pluginsMeta]
 */

/**
 * @typedef {Object} SquooshMinimizerOptions
 * @property {Object.<string, object>} [encodeOptions]
 */

/**
 * @typedef {Record<string, any>} CustomFnMinimizerOptions
 */

/**
 * @typedef {ImageminMinimizerOptions | SquooshMinimizerOptions | CustomFnMinimizerOptions} MinimizerOptions
 */

/**
 * @typedef {Object} InternalWorkerOptions
 * @property {string} filename
 * @property {Buffer} input
 * @property {MinifyFunctions} minify
 * @property {MinimizerOptions} [minimizerOptions]
 * @property {string} [severityError]
 * @property {string | FilenameFn} [newFilename]
 * @property {Function} [generateFilename]
 */

/**
 * @callback CustomMinifyFunction
 * @param {WorkerResult} original
 * @param {CustomFnMinimizerOptions} options
 * @returns {Promise<WorkerResult>}
 */

/**
 * @typedef {ImageminMinifyFunction | SquooshMinifyFunction | CustomMinifyFunction} MinifyFunctions
 */

/**
 * @typedef {Object} WorkerResult
 * @property {string} filename
 * @property {Buffer} data
 * @property {Array<Error>} warnings
 * @property {Array<Error>} errors
 * @property {AssetInfo} info
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

// TODO fix types for `generator`
/**
 * @typedef {Object} Generator
 * @property {Function} implementation
 * @property {string} preset
 * @property {any} options
 */

/**
 * @typedef {Object} PluginOptions
 * @property {FilterFn} [filter] Allows filtering of images for optimization.
 * @property {Rules} [test] Test to match files against.
 * @property {Rules} [include] Files to include.
 * @property {Rules} [exclude] Files to exclude.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {Generator[]} [generator] Allows to set generators.
 * @property {MinimizerOptions} [minimizerOptions] Options for `imagemin`.
 * @property {boolean} [loader] Automatically adding `imagemin-loader`.
 * @property {number} [concurrency] Maximum number of concurrency optimization processes in one time.
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
      test = /\.(jpe?g|png|gif|tif|webp|svg|avif|jxl)$/i,
      include,
      exclude,
      severityError,
      generator,
      minimizerOptions = {
        plugins: [],
      },
      loader = true,
      concurrency,
      filename = "[path][name][ext]",
      deleteOriginalAssets = false,
    } = options;

    this.options = {
      minify,
      minimizerOptions,
      generator,
      severityError,
      filter,
      exclude,
      include,
      loader,
      concurrency,
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
   * @param {Map<string, Object>} moduleAssets
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
            const newInfo = moduleAssets.get(name) || {};

            compilation.updateAsset(name, source, newInfo);

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
            minify: this.options.minify,
            minimizerOptions: this.options.minimizerOptions,
          });

          const eTag = cache.getLazyHashedEtag(source);
          const cacheItem = cache.getItemCache(cacheName, eTag);
          const output = await cacheItem.getPromise();

          return { name, info, inputSource: source, output, cacheItem };
        })
    );

    const cpus = os.cpus() || { length: 1 };
    const limit = this.options.concurrency || Math.max(1, cpus.length - 1);

    const { RawSource } = compiler.webpack.sources;

    const scheduledTasks = [];

    for (const asset of assetsForMinify) {
      scheduledTasks.push(async () => {
        const { name, inputSource, cacheItem } = asset;
        let { output } = asset;
        let input;

        const sourceFromInputSource = inputSource.source();

        if (!output) {
          input = sourceFromInputSource;

          if (!Buffer.isBuffer(input)) {
            input = Buffer.from(input);
          }

          const { severityError, minimizerOptions, minify } = this.options;

          const minifyOptions = /** @type {InternalWorkerOptions} */ ({
            filename: name,
            input,
            severityError,
            minify,
            minimizerOptions,
            newFilename: this.options.filename,
            generateFilename: compilation.getAssetPath.bind(compilation),
          });

          output = await worker(minifyOptions);

          output.source = new RawSource(output.data);

          await cacheItem.storePromise({
            source: output.source,
            info: output.info,
            filename: output.filename,
            warnings: output.warnings,
            errors: output.errors,
          });
        }

        if (output.warnings.length > 0) {
          /** @type {[WebpackError]} */
          (output.warnings).forEach((warning) => {
            compilation.warnings.push(warning);
          });
        }

        if (output.errors.length > 0) {
          /** @type {[WebpackError]} */
          (output.errors).forEach((error) => {
            compilation.errors.push(error);
          });
        }

        const isNewAsset = name !== output.filename;

        if (isNewAsset) {
          compilation.emitAsset(output.filename, output.source, output.info);

          if (this.options.deleteOriginalAssets) {
            compilation.deleteAsset(name);
          }
        } else {
          compilation.updateAsset(name, output.source, output.info);
        }
      });
    }

    await throttleAll(limit, scheduledTasks);
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    const pluginName = this.constructor.name;

    const moduleAssets = new Map();

    if (this.options.loader) {
      // Collect assets from modules
      compiler.hooks.compilation.tap({ name: pluginName }, (compilation) => {
        compilation.hooks.moduleAsset.tap(
          { name: pluginName },
          (module, file) => {
            moduleAssets.set(file, module.buildMeta.imageMinimizerPluginInfo);
          }
        );
      });

      compiler.hooks.afterPlugins.tap({ name: pluginName }, () => {
        const {
          minify,
          minimizerOptions,
          generator,
          filename,
          filter,
          test,
          include,
          exclude,
          severityError,
        } = this.options;

        const loader = /** @type {InternalLoaderOptions} */ ({
          test,
          include,
          exclude,
          enforce: "pre",
          loader: require.resolve(path.join(__dirname, "loader.js")),
          options: {
            minify,
            generator,
            filename,
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

      compilation.hooks.statsPrinter.tap(pluginName, (stats) => {
        stats.hooks.print
          .for("asset.info.minimized")
          .tap(
            "image-minimizer-webpack-plugin",
            (minimized, { green, formatFlag }) =>
              minimized
                ? /** @type {Function} */ (green)(
                    /** @type {Function} */ (formatFlag)("minimized")
                  )
                : ""
          );

        stats.hooks.print
          .for("asset.info.generated")
          .tap(
            "image-minimizer-webpack-plugin",
            (generated, { green, formatFlag }) =>
              generated
                ? /** @type {Function} */ (green)(
                    /** @type {Function} */ (formatFlag)("generated")
                  )
                : ""
          );
      });
    });
  }
}

ImageMinimizerPlugin.loader = require.resolve("./loader");
ImageMinimizerPlugin.imageminNormalizeConfig = imageminNormalizeConfig;
ImageMinimizerPlugin.imageminMinify = imageminMinify;
ImageMinimizerPlugin.imageminGenerate = imageminGenerate;
ImageMinimizerPlugin.squooshMinify = squooshMinify;
ImageMinimizerPlugin.squooshGenerate = squooshGenerate;

export default ImageMinimizerPlugin;
