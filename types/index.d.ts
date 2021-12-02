export default ImageMinimizerPlugin;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
export type Compiler = import("webpack").Compiler;
export type Compilation = import("webpack").Compilation;
export type WebpackError = import("webpack").WebpackError;
export type Asset = import("webpack").Asset;
export type AssetInfo = import("webpack").AssetInfo;
export type ImageminOptions = import("imagemin").Options;
export type LoaderOptions = import("./loader").LoaderOptions;
export type ImageminMinifyFunction = typeof imageminMinify;
export type SquooshMinifyFunction = typeof squooshMinify;
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type FilterFn = (source: Buffer, sourcePath: string) => boolean;
export type ImageminMinimizerOptions = {
  plugins: ImageminOptions["plugins"] | [string, Record<string, any>];
  pluginsMeta?: Record<string, any>[] | undefined;
};
export type SquooshMinimizerOptions = {
  encodeOptions?:
    | {
        [x: string]: object;
      }
    | undefined;
};
export type CustomMinifyFunction = (
  original: WorkerResult,
  options: CustomFnMinimizerOptions
) => Promise<WorkerResult>;
export type CustomFnMinimizerOptions = Record<string, any>;
export type MinifyFunctions =
  | ImageminMinifyFunction
  | SquooshMinifyFunction
  | CustomMinifyFunction;
export type MinimizerOptions =
  | ImageminMinimizerOptions
  | SquooshMinimizerOptions
  | CustomFnMinimizerOptions;
export type WorkerResult = {
  filename: string;
  data: Buffer;
  warnings: Array<Error>;
  errors: Array<Error>;
  info: AssetInfo;
};
export type TransformerOptions = Object;
export type TransformerFunction = (
  original: WorkerResult,
  options: TransformerOptions
) => Promise<WorkerResult>;
export type PathData = {
  filename?: string | undefined;
};
export type FilenameFn = (
  pathData: PathData,
  assetInfo?: import("webpack").AssetInfo | undefined
) => string;
export type Transformer = {
  implementation: TransformerFunction;
  filter?: FilterFn | undefined;
  filename?: string | FilenameFn | undefined;
  options?: Object | undefined;
};
export type Generator = Transformer & {
  preset: string;
};
export type Minimizer = Transformer;
export type InternalWorkerOptions = {
  filename: string;
  input: Buffer;
  transformer: Transformer | Transformer[];
  severityError?: string | undefined;
  generateFilename?: Function | undefined;
};
export type InternalLoaderOptions = {
  /**
   * Test to match files against.
   */
  test?: Rules | undefined;
  /**
   * Files to include.
   */
  include?: Rules | undefined;
  /**
   * Files to exclude.
   */
  exclude?: Rules | undefined;
  loader?: string | undefined;
  loaderOptions?: import("./loader").LoaderOptions | undefined;
};
export type PluginOptions = {
  /**
   * Test to match files against.
   */
  test?: Rules | undefined;
  /**
   * Files to include.
   */
  include?: Rules | undefined;
  /**
   * Files to exclude.
   */
  exclude?: Rules | undefined;
  /**
   * Allows to setup the minimizer.
   */
  minimizer?: Transformer | undefined;
  /**
   * Allows to set the generator.
   */
  generator?: Generator[] | undefined;
  /**
   * Automatically adding `imagemin-loader`.
   */
  loader?: boolean | undefined;
  /**
   * Maximum number of concurrency optimization processes in one time.
   */
  concurrency?: number | undefined;
  /**
   * Allows to choose how errors are displayed.
   */
  severityError?: string | undefined;
  /**
   * Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
   */
  deleteOriginalAssets?: boolean | undefined;
};
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
 * @callback CustomMinifyFunction
 * @param {WorkerResult} original
 * @param {CustomFnMinimizerOptions} options
 * @returns {Promise<WorkerResult>}
 */
/**
 * @typedef {Record<string, any>} CustomFnMinimizerOptions
 */
/**
 * @typedef {ImageminMinifyFunction | SquooshMinifyFunction | CustomMinifyFunction} MinifyFunctions
 */
/**
 * @typedef {ImageminMinimizerOptions | SquooshMinimizerOptions | CustomFnMinimizerOptions} MinimizerOptions
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
 * @typedef {Object} TransformerOptions
 */
/**
 * @callback TransformerFunction
 * @param {WorkerResult} original
 * @param {TransformerOptions} options
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
 * @typedef {Object} Transformer
 * @property {TransformerFunction} implementation
 * @property {FilterFn} [filter]
 * @property {string | FilenameFn} [filename]
 * @property {TransformerOptions} [options]
 */
/**
 * @typedef {Transformer & { preset: string }} Generator
 */
/**
 * @typedef {Transformer} Minimizer
 */
/**
 * @typedef {Object} InternalWorkerOptions
 * @property {string} filename
 * @property {Buffer} input
 * @property {Transformer | Transformer[]} transformer
 * @property {string} [severityError]
 * @property {Function} [generateFilename]
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
 * @property {Minimizer} [minimizer] Allows to setup the minimizer.
 * @property {Generator[]} [generator] Allows to set the generator.
 * @property {boolean} [loader] Automatically adding `imagemin-loader`.
 * @property {number} [concurrency] Maximum number of concurrency optimization processes in one time.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {boolean} [deleteOriginalAssets] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
 */
/**
 * @extends {WebpackPluginInstance}
 */
declare class ImageMinimizerPlugin {
  /**
   * @param {PluginOptions} [options={}] Plugin options.
   */
  constructor(options?: PluginOptions | undefined);
  options: {
    minimizer:
      | Transformer
      | {
          implementation: typeof imageminMinify;
          options: {
            plugins: never[];
          };
        };
    generator: Generator[] | undefined;
    severityError: string | undefined;
    exclude: Rules | undefined;
    include: Rules | undefined;
    loader: boolean;
    concurrency: number | undefined;
    test: Rules;
    deleteOriginalAssets: boolean;
  };
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {Map<string, Object>} moduleAssets
   * @returns {Promise<void>}
   */
  private optimize;
  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler: import("webpack").Compiler): void;
}
declare namespace ImageMinimizerPlugin {
  export const loader: string;
  export { imageminNormalizeConfig };
  export { imageminMinify };
  export { imageminGenerate };
  export { squooshMinify };
  export { squooshGenerate };
}
import { imageminMinify } from "./utils.js";
import { squooshMinify } from "./utils.js";
import { imageminNormalizeConfig } from "./utils.js";
import { imageminGenerate } from "./utils.js";
import { squooshGenerate } from "./utils.js";
