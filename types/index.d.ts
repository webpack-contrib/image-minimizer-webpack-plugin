export = ImageMinimizerPlugin;
/**
 * @template T, [G=T]
 * @extends {WebpackPluginInstance}
 */
declare class ImageMinimizerPlugin<T, G = T> {
  /**
   * @param {PluginOptions<T, G>=} options Plugin options.
   */
  constructor(options?: PluginOptions<T, G> | undefined);
  /**
   * @private
   */
  private options;
  /**
   * @private
   * @param {Compiler} compiler compiler
   * @param {Compilation} compilation compilation
   * @param {Record<string, Source>} assets assets
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
   * @param {Compiler} compiler compiler
   */
  apply(compiler: Compiler): void;
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
    Asset,
    AssetInfo,
    Source,
    Module,
    TemplatePath,
    PathData,
    ImageminMinifyFunction,
    SquooshMinifyFunction,
    Rule,
    Rules,
    FilterFn,
    IsFilenameProcessed,
    WorkerResult,
    Task,
    CustomOptions,
    InferDefaultType,
    BasicTransformerOptions,
    ResizeOptions,
    BasicTransformerImplementation,
    BasicTransformerHelpers,
    TransformerFunction,
    FilenameFn,
    Transformer,
    Minimizer,
    Generator,
    InternalWorkerOptions,
    InternalLoaderOptions,
    PluginOptions,
  };
}
declare var loader: string;
import { imageminNormalizeConfig } from "./utils.js";
import { imageminMinify } from "./utils.js";
import { imageminGenerate } from "./utils.js";
import { squooshMinify } from "./utils.js";
import { squooshGenerate } from "./utils.js";
import { sharpMinify } from "./utils.js";
import { sharpGenerate } from "./utils.js";
import { svgoMinify } from "./utils.js";
type Schema = import("schema-utils").Schema;
type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
type Compiler = import("webpack").Compiler;
type Compilation = import("webpack").Compilation;
type Asset = import("webpack").Asset;
type AssetInfo = import("webpack").AssetInfo;
type Source = import("webpack").sources.Source;
type Module = import("webpack").Module;
type TemplatePath = import("webpack").TemplatePath;
type PathData = import("webpack").PathData;
type ImageminMinifyFunction = typeof imageminMinify;
type SquooshMinifyFunction = typeof squooshMinify;
type Rule = RegExp | string;
type Rules = Rule[] | Rule;
type FilterFn = (source: Buffer, sourcePath: string) => boolean;
type IsFilenameProcessed = typeof import("./worker").isFilenameProcessed;
type WorkerResult = {
  /**
   * filename
   */
  filename: string;
  /**
   * data buffer
   */
  data: Buffer;
  /**
   * warnings
   */
  warnings: Array<Error>;
  /**
   * errors
   */
  errors: Array<Error>;
  /**
   * asset info
   */
  info: AssetInfo & {
    [worker.isFilenameProcessed]?: boolean;
  };
};
type Task<T> = {
  /**
   * task name
   */
  name: string;
  /**
   * asset info
   */
  info: AssetInfo;
  /**
   * input source
   */
  inputSource: Source;
  /**
   * output
   */
  output:
    | (WorkerResult & {
        source?: Source;
      })
    | undefined;
  /**
   * cache item
   */
  cacheItem: ReturnType<ReturnType<Compilation["getCache"]>["getItemCache"]>;
  /**
   * transformer
   */
  transformer: Transformer<T> | Transformer<T>[];
};
type CustomOptions = {
  [key: string]: any;
};
type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
type BasicTransformerOptions<T> = InferDefaultType<T> | undefined;
type ResizeOptions = {
  /**
   * width
   */
  width?: number | undefined;
  /**
   * height
   */
  height?: number | undefined;
  /**
   * unit
   */
  unit?: ("px" | "percent") | undefined;
  /**
   * true when enabled, otherwise false
   */
  enabled?: boolean | undefined;
};
type BasicTransformerImplementation<T> = (
  original: WorkerResult,
  options?: BasicTransformerOptions<T> | undefined,
) => Promise<WorkerResult | null>;
type BasicTransformerHelpers = {
  /**
   * setup function
   */
  setup?: (() => void) | undefined;
  /**
   * teardown function
   */
  teardown?: (() => void) | undefined;
};
type TransformerFunction<T> = BasicTransformerImplementation<T> &
  BasicTransformerHelpers;
type FilenameFn = (
  pathData: PathData,
  assetInfo?: AssetInfo | undefined,
) => string;
type Transformer<T> = {
  /**
   * implementation
   */
  implementation: TransformerFunction<T>;
  /**
   * options
   */
  options?: BasicTransformerOptions<T> | undefined;
  /**
   * filter
   */
  filter?: FilterFn | undefined;
  /**
   * filename
   */
  filename?: (string | FilenameFn) | undefined;
  /**
   * preset
   */
  preset?: string | undefined;
  /**
   * type
   */
  type?: ("import" | "asset") | undefined;
};
type Minimizer<T> = Omit<Transformer<T>, "preset" | "type">;
type Generator<T> = Transformer<T>;
type InternalWorkerOptions<T> = {
  /**
   * filename
   */
  filename: string;
  /**
   * asset info
   */
  info?: AssetInfo | undefined;
  /**
   * input buffer
   */
  input: Buffer;
  /**
   * transformer
   */
  transformer: Transformer<T> | Transformer<T>[];
  /**
   * severity error setting
   */
  severityError?: string | undefined;
  /**
   * filename generator function
   */
  generateFilename: (filename: TemplatePath, data: PathData) => string;
};
type InternalLoaderOptions<T> = import("./loader").LoaderOptions<T>;
type PluginOptions<T, G> = {
  /**
   * test to match files against
   */
  test?: Rule | undefined;
  /**
   * files to include
   */
  include?: Rule | undefined;
  /**
   * files to exclude
   */
  exclude?: Rule | undefined;
  /**
   * allows to set the minimizer
   */
  minimizer?:
    | (T extends any[]
        ? { [P in keyof T]: Minimizer<T[P]> }
        : Minimizer<T> | Minimizer<T>[])
    | undefined;
  /**
   * allows to set the generator
   */
  generator?:
    | (G extends any[] ? { [P in keyof G]: Generator<G[P]> } : Generator<G>[])
    | undefined;
  /**
   * automatically adding `image-loader`.
   */
  loader?: boolean | undefined;
  /**
   * maximum number of concurrency optimization processes in one time
   */
  concurrency?: number | undefined;
  /**
   * allows to choose how errors are displayed
   */
  severityError?: string | undefined;
  /**
   * allows to remove original assets, useful for converting to a `webp` and remove original assets
   */
  deleteOriginalAssets?: boolean | undefined;
};
import worker = require("./worker");
