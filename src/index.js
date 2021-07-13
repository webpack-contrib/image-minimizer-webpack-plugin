import * as path from "path";
import * as os from "os";

import pLimit from "p-limit";

import { validate } from "schema-utils";
import serialize from "serialize-javascript";

import minifyFn from "./minify";
import schema from "./plugin-options.json";
import imageminMinify, {
  imageminNormalizeConfig,
} from "./utils/imageminMinify";
import imageminGenerate from "./utils/imageminGenerate";
import squooshMinify from "./utils/squooshMinify";
import squooshGenerate from "./utils/squooshGenerate";

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("webpack").AssetInfo} AssetInfo */
/** @typedef {import("webpack").sources.RawSource} RawSource */
/** @typedef {import("imagemin").Options} ImageminOptions */
/** @typedef {import("./loader").LoaderOptions} LoaderOptions */
/** @typedef {import("./utils/imageminMinify").default} ImageminMinifyFunction */
/** @typedef {import("./utils/squooshMinify").default} SquooshMinifyFunction */

/** @typedef {RegExp | string} Rule */

/** @typedef {Rule[] | Rule} Rules */

/**
 * @typedef {Record.<string, Buffer>} DataForMinifyFn
 */

/**
 * @callback FilterFn
 * @param {MinifyFnResult} input
 * @returns {boolean}
 */

/**
 * @typedef {Object} PathData
 * @property {string} [filename]
 */

/**
 * @typedef {Object} KnownMinimizerOptions
 * @property {FilterFn} [filter]
 * @property {string | function(PathData, AssetInfo=): string} [filename]
 * @property {boolean} [deleteOriginal] Allows to remove original assets.
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
 * @typedef {Object.<string, any>} CustomFnMinimizerOptions
 */

/**
 * @typedef {KnownMinimizerOptions & ImageminMinimizerOptions | KnownMinimizerOptions & SquooshMinimizerOptions | KnownMinimizerOptions & CustomFnMinimizerOptions} MinimizerOptions
 */

/**
 * @typedef {Object} InternalMinifyOptions
 * @property {string} filename
 * @property {Buffer} input
 * @property {AssetInfo} info
 * @property {MinifyFunctions} minify
 * @property {MinimizerOptions} [minimizerOptions]
 * @property {string} [severityError]
 * @property {Compilation["getAssetPath"]} generateFilename
 */

/**
 * @typedef {Object} InternalMinifyFnResult
 * @property {string} filename
 * @property {RawSource} data
 * @property {Array<Error>} warnings
 * @property {Array<Error>} errors
 * @property {AssetInfo} [info]
 * @property {boolean} [squooshMinify]
 * @property {boolean} [squooshGenerate]
 * @property {boolean} [imageminMinify]
 * @property {boolean} [imageminGenerate]
 */

/**
 * @typedef {Object} MinifyFnResult
 * @property {string} filename
 * @property {Buffer} data
 * @property {Array<Error>} warnings
 * @property {Array<Error>} errors
 * @property {AssetInfo} [info]
 * @property {boolean} [squooshMinify]
 * @property {boolean} [squooshGenerate]
 * @property {boolean} [imageminMinify]
 * @property {boolean} [imageminGenerate]
 */

/**
 * @callback CustomMinifyFunction
 * @param {MinifyFnResult} original
 * @param {CustomFnMinimizerOptions} minifyOptions
 * @returns {MinifyFnResult | MinifyFnResult[]}
 */

/**
 * @typedef {ImageminMinifyFunction | SquooshMinifyFunction | CustomMinifyFunction} MinifyFunctions
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
 * @typedef {Object} PluginOptions
 * @property {Rules} [test] Test to match files against.
 * @property {Rules} [include] Files to include.
 * @property {Rules} [exclude] Files to exclude.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {MinimizerOptions} [minimizerOptions] Options for `imagemin`.
 * @property {boolean} [loader] Automatically adding `imagemin-loader`.
 * @property {number} [maxConcurrency] Maximum number of concurrency optimization processes in one time.
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
      test = /\.(jpe?g|png|gif|tif|webp|svg|avif)$/i,
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
      minify,
      severityError,
      exclude,
      minimizerOptions,
      include,
      loader,
      maxConcurrency,
      test,
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
          const { info } = /** @type {Asset} */ (compilation.getAsset(name));

          // Skip double minimize assets from child compilation
          // TODO possible bug
          if (info.minimized || info.generated) {
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
              info,
              minify,
              minimizerOptions,
              severityError,
              generateFilename: compilation.getAssetPath.bind(compilation),
            });

            output = await minifyFn(minifyOptions);

            output = /** @type {MinifyFnResult[]} */ (output).map((item) => {
              // TODO fix me
              // @ts-ignore
              item.data = new RawSource(item.data);

              return item;
            });

            await cacheItem.storePromise(output);
          }

          let hasOriginal = false;

          /** @type {InternalMinifyFnResult[]} */
          (output).forEach((item) => {
            if (name === item.filename) {
              hasOriginal = true;
            }

            if (this.options.severityError !== "off") {
              if (item.errors && item.errors.length > 0) {
                /** @type {[WebpackError]} */ (item.errors).forEach((error) => {
                  if (this.options.severityError === "warning") {
                    compilation.warnings.push(error);
                  } else {
                    compilation.errors.push(error);
                  }
                });
              }

              if (item.warnings && item.warnings.length > 0) {
                /** @type {[WebpackError]} */ (item.warnings).forEach(
                  (warning) => {
                    compilation.warnings.push(warning);
                  }
                );
              }
            }

            // TODO need to merge with before `info`?
            // TODO check `related` usage
            if (compilation.getAsset(item.filename)) {
              compilation.updateAsset(item.filename, item.data, item.info);
            } else {
              compilation.emitAsset(item.filename, item.data, item.info);
            }
          });

          if (!hasOriginal) {
            compilation.deleteAsset(name);
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
            severityError,
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
ImageMinimizerPlugin.imageminNormalizeConfig = imageminNormalizeConfig;
ImageMinimizerPlugin.imageminMinify = imageminMinify;
ImageMinimizerPlugin.imageminGenerate = imageminGenerate;
ImageMinimizerPlugin.squooshMinify = squooshMinify;
ImageMinimizerPlugin.squooshGenerate = squooshGenerate;

export default ImageMinimizerPlugin;
