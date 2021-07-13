export default ImageMinimizerPlugin;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
export type Compiler = import("webpack").Compiler;
export type Compilation = import("webpack").Compilation;
export type WebpackError = import("webpack").WebpackError;
export type Asset = import("webpack").Asset;
export type AssetInfo = import("webpack").AssetInfo;
export type RawSource = import("webpack").sources.RawSource;
export type ImageminOptions = import("imagemin").Options;
export type LoaderOptions = import("./loader").LoaderOptions;
export type ImageminMinifyFunction = typeof imageminMinify;
export type SquooshMinifyFunction = typeof squooshMinify;
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type DataForMinifyFn = Record<string, Buffer>;
export type FilterFn = (input: MinifyFnResult) => boolean;
export type PathData = {
  filename?: string | undefined;
};
export type KnownMinimizerOptions = {
  filter?: FilterFn | undefined;
  filename?:
    | string
    | ((arg0: PathData, arg1?: AssetInfo | undefined) => string)
    | undefined;
  /**
   * Allows to remove original assets.
   */
  deleteOriginal?: boolean | undefined;
};
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
export type CustomFnMinimizerOptions = {
  [x: string]: any;
};
export type MinimizerOptions =
  | (KnownMinimizerOptions & ImageminMinimizerOptions)
  | (KnownMinimizerOptions & SquooshMinimizerOptions)
  | (KnownMinimizerOptions & CustomFnMinimizerOptions);
export type InternalMinifyOptions = {
  filename: string;
  input: Buffer;
  info: AssetInfo;
  minify: MinifyFunctions;
  minimizerOptions?: MinimizerOptions | undefined;
  severityError?: string | undefined;
  generateFilename: Compilation["getAssetPath"];
};
export type InternalMinifyFnResult = {
  filename: string;
  data: RawSource;
  warnings: Array<Error>;
  errors: Array<Error>;
  info?: import("webpack").AssetInfo | undefined;
  squooshMinify?: boolean | undefined;
  squooshGenerate?: boolean | undefined;
  imageminMinify?: boolean | undefined;
  imageminGenerate?: boolean | undefined;
};
export type MinifyFnResult = {
  filename: string;
  data: Buffer;
  warnings: Array<Error>;
  errors: Array<Error>;
  info?: import("webpack").AssetInfo | undefined;
};
export type CustomMinifyFunction = (
  original: MinifyFnResult,
  minifyOptions: CustomFnMinimizerOptions
) => MinifyFnResult | MinifyFnResult[];
export type MinifyFunctions =
  | ImageminMinifyFunction
  | SquooshMinifyFunction
  | CustomMinifyFunction;
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
   * Allows to choose how errors are displayed.
   */
  severityError?: string | undefined;
  /**
   * Options for `imagemin`.
   */
  minimizerOptions?: MinimizerOptions | undefined;
  /**
   * Automatically adding `imagemin-loader`.
   */
  loader?: boolean | undefined;
  /**
   * Maximum number of concurrency optimization processes in one time.
   */
  maxConcurrency?: number | undefined;
  minify?: MinifyFunctions | undefined;
};
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
declare class ImageMinimizerPlugin {
  /**
   * @param {PluginOptions} [options={}] Plugin options.
   */
  constructor(options?: PluginOptions | undefined);
  options: {
    minify: MinifyFunctions;
    severityError: string | undefined;
    exclude: Rules | undefined;
    minimizerOptions: MinimizerOptions;
    include: Rules | undefined;
    loader: boolean;
    maxConcurrency: number | undefined;
    test: Rules;
  };
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import("webpack").sources.Source>} assets
   * @param {Set<string>} moduleAssets
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
import imageminMinify from "./utils/imageminMinify";
import squooshMinify from "./utils/squooshMinify";
import { imageminNormalizeConfig } from "./utils/imageminMinify";
import imageminGenerate from "./utils/imageminGenerate";
import squooshGenerate from "./utils/squooshGenerate";
