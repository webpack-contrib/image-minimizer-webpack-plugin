export default ImageMinimizerPlugin;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
export type Compiler = import("webpack").Compiler;
export type Compilation = import("webpack").Compilation;
export type WebpackError = import("webpack").WebpackError;
export type Asset = import("webpack").Asset;
export type AssetInfo = import("webpack").AssetInfo;
export type ImageminMinifyFunction = typeof imageminMinify;
export type SquooshMinifyFunction = typeof squooshMinify;
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type FilterFn = (source: Buffer, sourcePath: string) => boolean;
export type ImageminOptions = {
  plugins: Array<
    string | [string, Record<string, any>?] | import("imagemin").Plugin
  >;
};
export type SquooshOptions = {
  [x: string]: any;
};
export type WorkerResult = {
  filename: string;
  data: Buffer;
  warnings: Array<Error>;
  errors: Array<Error>;
  info: AssetInfo;
};
export type CustomOptions = {
  [key: string]: any;
};
export type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
export type BasicTransformerOptions<T> = InferDefaultType<T> | undefined;
export type BasicTransformerImplementation<T> = (
  original: WorkerResult,
  options?: BasicTransformerOptions<T>
) => Promise<WorkerResult>;
export type BasicTransformerHelpers = {
  setup?: (() => {}) | undefined;
  teardown?: (() => {}) | undefined;
};
export type TransformerFunction<T> = BasicTransformerImplementation<T> &
  BasicTransformerHelpers;
export type PathData = {
  filename?: string | undefined;
};
export type FilenameFn = (
  pathData: PathData,
  assetInfo?: import("webpack").AssetInfo | undefined
) => string;
export type Transformer<T> = {
  implementation: TransformerFunction<T>;
  options?: BasicTransformerOptions<T>;
  filter?: FilterFn | undefined;
  filename?: string | FilenameFn | undefined;
  preset?: string | undefined;
};
export type Minimizer<T> = Omit<Transformer<T>, "preset">;
export type Generator<T> = Transformer<T>;
export type InternalWorkerOptions<T> = {
  filename: string;
  input: Buffer;
  transformer: Transformer<T> | Transformer<T>[];
  severityError?: string | undefined;
  generateFilename?: Function | undefined;
};
export type InternalLoaderOptions<T> = import("./loader").LoaderOptions<T>;
export type PluginOptions<T, G> = {
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
  minimizer?:
    | (T extends any[]
        ? { [P in keyof T]: Minimizer<T[P]> }
        : Minimizer<T> | Minimizer<T>[])
    | undefined;
  /**
   * Allows to set the generator.
   */
  generator?:
    | (G extends any[]
        ? { [P_1 in keyof G]: Generator<G[P_1]> }
        : Generator<G>[])
    | undefined;
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
 * @property {Array<string | [string, Record<string, any>?] | import("imagemin").Plugin>} plugins
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
 * @typedef {{ [key: string]: any }} CustomOptions
 */
/**
 * @template T
 * @typedef {T extends infer U ? U : CustomOptions} InferDefaultType
 */
/**
 * @template T
 * @typedef {InferDefaultType<T> | undefined} BasicTransformerOptions
 */
/**
 * @template T
 * @callback BasicTransformerImplementation
 * @param {WorkerResult} original
 * @param {BasicTransformerOptions<T>} [options]
 * @returns {Promise<WorkerResult>}
 */
/**
 * @typedef {object} BasicTransformerHelpers
 * @property {() => {}} [setup]
 * @property {() => {}} [teardown]
 */
/**
 * @template T
 * @typedef {BasicTransformerImplementation<T> & BasicTransformerHelpers} TransformerFunction
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
 * @property {BasicTransformerOptions<T>} [options]
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
 * @template T, G
 * @typedef {Object} PluginOptions
 * @property {Rules} [test] Test to match files against.
 * @property {Rules} [include] Files to include.
 * @property {Rules} [exclude] Files to exclude.
 * @property {T extends any[] ? { [P in keyof T]: Minimizer<T[P]> } : Minimizer<T> | Minimizer<T>[]} [minimizer] Allows to setup the minimizer.
 * @property {G extends any[] ? { [P in keyof G]: Generator<G[P]> } : Generator<G>[]} [generator] Allows to set the generator.
 * @property {boolean} [loader] Automatically adding `imagemin-loader`.
 * @property {number} [concurrency] Maximum number of concurrency optimization processes in one time.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {boolean} [deleteOriginalAssets] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
 */
/**
 * @template T, [G=T]
 * @extends {WebpackPluginInstance}
 */
declare class ImageMinimizerPlugin<T, G = T> {
  /**
   * @param {PluginOptions<T, G>} [options={}] Plugin options.
   */
  constructor(options?: PluginOptions<T, G> | undefined);
  /**
   * @private
   */
  private options;
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @returns {Promise<void>}
   */
  private optimize;
  /**
   * @private
   */
  private setupAll;
  /**
   * @private
   */
  private teardownAll;
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
