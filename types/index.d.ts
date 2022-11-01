export = ImageMinimizerPlugin;
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Asset} Asset */
/** @typedef {import("webpack").AssetInfo} AssetInfo */
/** @typedef {import("webpack").sources.Source} Source */
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
 * @template T
 * @typedef {Object} Task
 * @property {string} name
 * @property {AssetInfo} info
 * @property {Source} inputSource
 * @property {WorkerResult & { source?: Source } | undefined} output
 * @property {ReturnType<ReturnType<Compilation["getCache"]>["getItemCache"]>} cacheItem
 * @property {Transformer<T> | Transformer<T>[]} transformer
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
 * @typedef {Object} ResizeOptions
 * @property {number} [width]
 * @property {number} [height]
 * @property {boolean} [enabled]
 */
/**
 * @template T
 * @callback BasicTransformerImplementation
 * @param {WorkerResult} original
 * @param {BasicTransformerOptions<T>} [options]
 * @returns {Promise<WorkerResult | null>}
 */
/**
 * @typedef {Object} BasicTransformerHelpers
 * @property {() => void} [setup]
 * @property {() => void} [teardown]
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
 * @property {"import" | "asset"} [type]
 */
/**
 * @template T
 * @typedef {Omit<Transformer<T>, "preset" | "type">} Minimizer
 */
/**
 * @template T
 * @typedef {Transformer<T>} Generator
 */
/**
 * @template T
 * @typedef {Object} InternalWorkerOptions
 * @property {string} filename
 * @property {AssetInfo=} info
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
   * @param {Record<string, Source>} assets
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
  export {
    loader,
    imageminNormalizeConfig,
    imageminMinify,
    imageminGenerate,
    squooshMinify,
    squooshGenerate,
    sharpMinify,
    sharpGenerate,
    svgoMinify,
    Schema,
    WebpackPluginInstance,
    Compiler,
    Compilation,
    WebpackError,
    Asset,
    AssetInfo,
    Source,
    ImageminMinifyFunction,
    SquooshMinifyFunction,
    Rule,
    Rules,
    FilterFn,
    ImageminOptions,
    SquooshOptions,
    WorkerResult,
    Task,
    CustomOptions,
    InferDefaultType,
    BasicTransformerOptions,
    ResizeOptions,
    BasicTransformerImplementation,
    BasicTransformerHelpers,
    TransformerFunction,
    PathData,
    FilenameFn,
    Transformer,
    Minimizer,
    Generator,
    InternalWorkerOptions,
    InternalLoaderOptions,
    PluginOptions,
  };
}
type PluginOptions<T, G> = {
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
        ? T extends infer T_1
          ? { [P in keyof T_1]: Minimizer<T[P]> }
          : never
        : Minimizer<T> | Minimizer<T>[])
    | undefined;
  /**
   * Allows to set the generator.
   */
  generator?:
    | (G extends any[]
        ? G extends infer T_2
          ? { [P_1 in keyof T_2]: Generator<G[P_1]> }
          : never
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
declare var loader: string;
import { imageminNormalizeConfig } from "./utils.js";
import { imageminMinify } from "./utils.js";
import { imageminGenerate } from "./utils.js";
import { squooshMinify } from "./utils.js";
import { squooshGenerate } from "./utils.js";
import { sharpMinify } from "./utils.js";
import { sharpGenerate } from "./utils.js";
import { svgoMinify } from "./utils.js";
type Schema = import("schema-utils/declarations/validate").Schema;
type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
type Compiler = import("webpack").Compiler;
type Compilation = import("webpack").Compilation;
type WebpackError = import("webpack").WebpackError;
type Asset = import("webpack").Asset;
type AssetInfo = import("webpack").AssetInfo;
type Source = import("webpack").sources.Source;
type ImageminMinifyFunction = typeof imageminMinify;
type SquooshMinifyFunction = typeof squooshMinify;
type Rule = RegExp | string;
type Rules = Rule[] | Rule;
type FilterFn = (source: Buffer, sourcePath: string) => boolean;
type ImageminOptions = {
  plugins: Array<
    string | [string, Record<string, any>?] | import("imagemin").Plugin
  >;
};
type SquooshOptions = {
  [x: string]: any;
};
type WorkerResult = {
  filename: string;
  data: Buffer;
  warnings: Array<Error>;
  errors: Array<Error>;
  info: AssetInfo;
};
type Task<T> = {
  name: string;
  info: AssetInfo;
  inputSource: Source;
  output:
    | (WorkerResult & {
        source?: Source;
      })
    | undefined;
  cacheItem: ReturnType<ReturnType<Compilation["getCache"]>["getItemCache"]>;
  transformer: Transformer<T> | Transformer<T>[];
};
type CustomOptions = {
  [key: string]: any;
};
type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
type BasicTransformerOptions<T> = InferDefaultType<T> | undefined;
type ResizeOptions = {
  width?: number | undefined;
  height?: number | undefined;
  enabled?: boolean | undefined;
};
type BasicTransformerImplementation<T> = (
  original: WorkerResult,
  options?: BasicTransformerOptions<T>
) => Promise<WorkerResult | null>;
type BasicTransformerHelpers = {
  setup?: (() => void) | undefined;
  teardown?: (() => void) | undefined;
};
type TransformerFunction<T> = BasicTransformerImplementation<T> &
  BasicTransformerHelpers;
type PathData = {
  filename?: string | undefined;
};
type FilenameFn = (
  pathData: PathData,
  assetInfo?: import("webpack").AssetInfo | undefined
) => string;
type Transformer<T> = {
  implementation: TransformerFunction<T>;
  options?: BasicTransformerOptions<T>;
  filter?: FilterFn | undefined;
  filename?: string | FilenameFn | undefined;
  preset?: string | undefined;
  type?: "import" | "asset" | undefined;
};
type Minimizer<T> = Omit<Transformer<T>, "preset" | "type">;
type Generator<T> = Transformer<T>;
type InternalWorkerOptions<T> = {
  filename: string;
  info?: AssetInfo | undefined;
  input: Buffer;
  transformer: Transformer<T> | Transformer<T>[];
  severityError?: string | undefined;
  generateFilename?: Function | undefined;
};
type InternalLoaderOptions<T> = import("./loader").LoaderOptions<T>;
