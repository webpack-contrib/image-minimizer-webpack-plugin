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
 * @typedef {Object} ImageminOptions
 * @property {import("imagemin").Options["plugins"] | [string, Record<string, any>]} plugins
 * @property {Array<Record<string, any>>} [pluginsMeta]
 */

/**
 * @typedef {Object.<string, any>} SquooshOptions
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
 * @template T
 * @callback TransformerFunction
 * @param {WorkerResult} original
 * @param {T | undefined} options
 * @returns {Promise<WorkerResult>}
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
 * @template T
 * @typedef {Object} Transformer
 * @property {TransformerFunction<T>} implementation
 * @property {T} [options]
 * @property {FilterFn} [filter]
 * @property {string | FilenameFn} [filename]
 * @property {string} [preset]
 */

/**
 * @template T
 * @typedef {Omit<Transformer<T>, "preset">} Minimizer
 */

/**
 * @template T
 * @typedef {Transformer<T>} Generator
 */

/**
 * @template T
 * @typedef {Object} InternalWorkerOptions
 * @property {string} filename
 * @property {Buffer} input
 * @property {Transformer<T> | Transformer<T>[]} transformer
 * @property {string} [severityError]
 * @property {Function} [generateFilename]
 */

/**
 * @template T
 * @typedef {import("./loader").LoaderOptions<T>} InternalLoaderOptions
 */

/**
 * @template T
 * @typedef {Object} PluginOptions
 * @property {Rules} [test] Test to match files against.
 * @property {Rules} [include] Files to include.
 * @property {Rules} [exclude] Files to exclude.
 * @property {Minimizer<T> | Minimizer<T>[]} [minimizer] Allows to setup the minimizer.
 * @property {Generator<T>[]} [generator] Allows to set the generator.
 * @property {boolean} [loader] Automatically adding `imagemin-loader`.
 * @property {number} [concurrency] Maximum number of concurrency optimization processes in one time.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {boolean} [deleteOriginalAssets] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
 */

/**
 * @template T
 * @extends {WebpackPluginInstance}
 */
class ImageMinimizerPlugin {
  /**
   * @param {PluginOptions<T>} [options={}] Plugin options.
   */
  constructor(options = {}) {
    validate(/** @type {Schema} */ (schema), options, {
      name: "Image Minimizer Plugin",
      baseDataPath: "options",
    });

    const {
      minimizer,
      test = /\.(jpe?g|png|gif|tif|webp|svg|avif|jxl)$/i,
      include,
      exclude,
      severityError,
      generator,
      loader = true,
      concurrency,
      deleteOriginalAssets = true,
    } = options;

    if (!minimizer && !generator) {
      throw new Error(
        "Not configured 'minimizer' or 'generator' options, please setup them"
      );
    }

    /**
     * @private
     */
    this.options = {
      minimizer,
      generator,
      severityError,
      exclude,
      include,
      loader,
      concurrency,
      test,
      deleteOriginalAssets,
    };
  }

  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @returns {Promise<void>}
   */
  async optimize(compiler, compilation, assets) {
    if (!this.options.minimizer) {
      return;
    }

    const cache = compilation.getCache("ImageMinimizerWebpackPlugin");
    const assetsForMinify = await Promise.all(
      Object.keys(assets)
        .filter((name) => {
          const { info } = /** @type {Asset} */ (compilation.getAsset(name));

          // Skip double minimize assets from child compilation
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

          // // Exclude already optimized assets from `image-minimizer-webpack-loader`
          // if (this.options.loader && moduleAssets.has(name)) {
          //   const newInfo = moduleAssets.get(name) || {};
          //
          //   compilation.updateAsset(name, source, newInfo);
          //
          //   return false;
          // }

          return true;
        })
        .map(async (name) => {
          const { info, source } = /** @type {Asset} */ (
            compilation.getAsset(name)
          );

          const cacheName = serialize({
            name,
            minimizer: this.options.minimizer,
            generator: this.options.generator,
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

          const minifyOptions = /** @type {InternalWorkerOptions<T>} */ ({
            filename: name,
            input,
            severityError: this.options.severityError,
            transformer: this.options.minimizer,
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

        if (compilation.getAsset(output.filename)) {
          compilation.updateAsset(output.filename, output.source, output.info);
        } else {
          compilation.emitAsset(output.filename, output.source, output.info);

          if (this.options.deleteOriginalAssets) {
            compilation.deleteAsset(name);
          }
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

    if (this.options.loader) {
      compiler.hooks.compilation.tap({ name: pluginName }, (compilation) => {
        // Collect asset and update info from old loaders
        compilation.hooks.moduleAsset.tap(
          { name: pluginName },
          (module, file) => {
            const newInfo =
              module &&
              module.buildMeta &&
              module.buildMeta.imageMinimizerPluginInfo;

            if (newInfo) {
              const asset = /** @type {Asset} */ (compilation.getAsset(file));

              compilation.updateAsset(file, asset.source, newInfo);
            }
          }
        );

        // Collect asset modules and update info for asset modules
        compilation.hooks.assetPath.tap(
          { name: pluginName },
          (filename, data, info) => {
            const newInfo =
              data &&
              // @ts-ignore
              data.module &&
              // @ts-ignore
              data.module.buildMeta &&
              // @ts-ignore
              data.module.buildMeta.imageMinimizerPluginInfo;

            if (newInfo) {
              Object.assign(info || {}, newInfo);
            }

            return filename;
          }
        );
      });

      compiler.hooks.afterPlugins.tap({ name: pluginName }, () => {
        const { minimizer, generator, test, include, exclude, severityError } =
          this.options;

        const loader = /** @type {InternalLoaderOptions<T>} */ ({
          test,
          include,
          exclude,
          enforce: "pre",
          loader: require.resolve(path.join(__dirname, "loader.js")),
          options:
            /** @type {import("./loader").LoaderOptions<T>} */
            ({ generator, minimizer, severityError }),
        });
        const dataURILoader = /** @type {InternalLoaderOptions<T>} */ ({
          scheme: /^data$/,
          enforce: "pre",
          loader: require.resolve(path.join(__dirname, "loader.js")),
          options:
            /** @type {import("./loader").LoaderOptions<T>} */
            ({ generator, minimizer, severityError }),
        });

        compiler.options.module.rules.push(loader);
        compiler.options.module.rules.push(dataURILoader);
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
        (assets) => this.optimize(compiler, compilation, assets)
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
