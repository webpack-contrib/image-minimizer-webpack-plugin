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
   * @param {Compiler} compiler The webpack compiler
   * @param {Compilation} compilation The webpack compilation
   * @param {Record<string, Source>} assets The assets to optimize
   * @returns {Promise<void>} Promise that resolves when optimization is complete
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
   * @param {import("webpack").Compiler} compiler The webpack compiler instance
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
    Module,
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
type Schema = import("schema-utils/declarations/validate").Schema;
type WebpackPluginInstance = import("webpack").WebpackPluginInstance;
type Compiler = import("webpack").Compiler;
type Compilation = import("webpack").Compilation;
type WebpackError = import("webpack").WebpackError;
type Asset = import("webpack").Asset;
type AssetInfo = import("webpack").AssetInfo;
type Source = import("webpack").sources.Source;
type Module = import("webpack").Module;
type ImageminMinifyFunction = typeof imageminMinify;
type SquooshMinifyFunction = typeof squooshMinify;
type Rule = RegExp | string;
type Rules = Rule[] | Rule;
type FilterFn = (source: Buffer, sourcePath: string) => boolean;
type ImageminOptions = {
  /**
   * The plugins array
   */
  plugins: Array<
    string | [string, Record<string, unknown>?] | import("imagemin").Plugin
  >;
};
type SquooshOptions = Record<string, unknown>;
type WorkerResult = {
  /**
   * The filename
   */
  filename: string;
  /**
   * The data buffer
   */
  data: Buffer;
  /**
   * The warnings array
   */
  warnings: Array<Error>;
  /**
   * The errors array
   */
  errors: Array<Error>;
  /**
   * The asset info
   */
  info: AssetInfo;
};
type Task<T> = {
  /**
   * The task name
   */
  name: string;
  /**
   * The asset info
   */
  info: AssetInfo;
  /**
   * The input source
   */
  inputSource: Source;
  /**
   * The output
   */
  output:
    | (WorkerResult & {
        source?: Source;
      })
    | undefined;
  /**
   * The cache item
   */
  cacheItem: ReturnType<ReturnType<Compilation["getCache"]>["getItemCache"]>;
  /**
   * The transformer
   */
  transformer: Transformer<T> | Transformer<T>[];
};
type CustomOptions = Record<string, unknown>;
type InferDefaultType<T> = T extends infer U ? U : CustomOptions;
type BasicTransformerOptions<T> = InferDefaultType<T> | undefined;
type ResizeOptions = {
  /**
   * The width
   */
  width?: number | undefined;
  /**
   * The height
   */
  height?: number | undefined;
  /**
   * The unit
   */
  unit?: ("px" | "percent") | undefined;
  /**
   * Whether enabled
   */
  enabled?: boolean | undefined;
};
type BasicTransformerImplementation<T> = (
  original: WorkerResult,
  options?: BasicTransformerOptions<T> | undefined,
) => Promise<WorkerResult | null>;
type BasicTransformerHelpers = {
  /**
   * The setup function
   */
  setup?: (() => void) | undefined;
  /**
   * The teardown function
   */
  teardown?: (() => void) | undefined;
};
type TransformerFunction<T> = BasicTransformerImplementation<T> &
  BasicTransformerHelpers;
type PathData = {
  /**
   * The filename
   */
  filename?: string | undefined;
};
type FilenameFn = (
  pathData: PathData,
  assetInfo?: AssetInfo | undefined,
) => string;
type Transformer<T> = {
  /**
   * The implementation
   */
  implementation: TransformerFunction<T>;
  /**
   * The options
   */
  options?: BasicTransformerOptions<T> | undefined;
  /**
   * The filter
   */
  filter?: FilterFn | undefined;
  /**
   * The filename
   */
  filename?: (string | FilenameFn) | undefined;
  /**
   * The preset
   */
  preset?: string | undefined;
  /**
   * The type
   */
  type?: ("import" | "asset") | undefined;
};
type Minimizer<T> = Omit<Transformer<T>, "preset" | "type">;
type Generator<T> = Transformer<T>;
type InternalWorkerOptions<T> = {
  /**
   * The filename
   */
  filename: string;
  /**
   * The asset info
   */
  info?: AssetInfo | undefined;
  /**
   * The input buffer
   */
  input: Buffer;
  /**
   * The transformer
   */
  transformer: Transformer<T> | Transformer<T>[];
  /**
   * The severity error setting
   */
  severityError?: string | undefined;
  /**
   * The filename generator function
   */
  generateFilename?:
    | ((
        filenameTemplate: string,
        options: {
          filename: string;
        },
      ) => string)
    | undefined;
};
type PluginOptions<T, G> = {
  /**
   * Test to match files against.
   */
  test?: Rule | undefined;
  /**
   * Files to include.
   */
  include?: Rule | undefined;
  /**
   * Files to exclude.
   */
  exclude?: Rule | undefined;
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
    | (G extends any[] ? { [P in keyof G]: Generator<G[P]> } : Generator<G>[])
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
