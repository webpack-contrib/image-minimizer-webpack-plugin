export default ImageMinimizerPlugin;
export type WebpackPluginInstance = import('webpack').WebpackPluginInstance;
export type Compiler = import('webpack').Compiler;
export type Compilation = import('webpack').Compilation;
export type Filter = (source: Buffer, sourcePath: string) => boolean;
export type PluginOptions = {
  /**
   * Allows filtering of images for optimization.
   */
  filter?: Filter | undefined;
  /**
   * Test to match files against.
   */
  test?: string | RegExp | (string | RegExp)[] | undefined;
  /**
   * Files to include.
   */
  include?: string | RegExp | (string | RegExp)[] | undefined;
  /**
   * Files to exclude.
   */
  exclude?: string | RegExp | (string | RegExp)[] | undefined;
  /**
   * Allows to choose how errors are displayed.
   */
  severityError?: string | boolean | undefined;
  /**
   * Options for `imagemin`.
   */
  minimizerOptions?: Object | undefined;
  /**
   * Automatically adding `imagemin-loader`.
   */
  loader?: boolean | undefined;
  /**
   * Maximum number of concurrency optimization processes in one time.
   */
  maxConcurrency?: number | undefined;
  /**
   * Allows to set the filename for the generated asset. Useful for converting to a `webp`.
   */
  filename?: string | undefined;
  /**
   * Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
   */
  deleteOriginalAssets?: boolean | undefined;
};
/** @typedef {import("webpack").WebpackPluginInstance} WebpackPluginInstance */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Compilation} Compilation */
/**
 * @callback Filter
 * @param {Buffer} source `Buffer` of source file.
 * @param {string} sourcePath Absolute path to source.
 * @returns {boolean}
 */
/**
 * @typedef {Object} PluginOptions
 * @property {Filter} [filter=() => true] Allows filtering of images for optimization.
 * @property {string|RegExp|Array<string|RegExp>} [test=/\.(jpe?g|png|gif|tif|webp|svg|avif)$/i] Test to match files against.
 * @property {string|RegExp|Array<string|RegExp>} [include] Files to include.
 * @property {string|RegExp|Array<string|RegExp>} [exclude] Files to exclude.
 * @property {boolean|string} [severityError='auto'] Allows to choose how errors are displayed.
 * @property {Object} [minimizerOptions={plugins: []}] Options for `imagemin`.
 * @property {boolean} [loader=true] Automatically adding `imagemin-loader`.
 * @property {number} [maxConcurrency=Math.max(1, os.cpus().length - 1)] Maximum number of concurrency optimization processes in one time.
 * @property {string} [filename='[path][name][ext]'] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {boolean} [deleteOriginalAssets=false] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
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
    severityError: string | boolean | undefined;
    filter: Filter;
    exclude: string | RegExp | (string | RegExp)[] | undefined;
    minimizerOptions:
      | Object
      | {
          plugins: never[];
        };
    include: string | RegExp | (string | RegExp)[] | undefined;
    loader: boolean;
    maxConcurrency: number | undefined;
    test: string | RegExp | (string | RegExp)[];
    filename: string;
    deleteOriginalAssets: boolean;
  };
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param assets
   * @param moduleAssets
   * @returns {Promise<void>}
   */
  private optimize;
  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler: import('webpack').Compiler): void;
}
declare namespace ImageMinimizerPlugin {
  const loader: string;
  const normalizeConfig: typeof import('./utils/normalize-config').default;
}
