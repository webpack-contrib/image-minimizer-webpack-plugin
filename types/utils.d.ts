export type WorkerResult = import("./index").WorkerResult;
export type SquooshOptions = import("./index").SquooshOptions;
export type ImageminOptions = import("imagemin").Options;
export type WebpackError = import("webpack").WebpackError;
export type Module = import("webpack").Module;
export type AssetInfo = import("webpack").AssetInfo;
export type Task<T> = () => Promise<T>;
export type SvgoLib = typeof import("svgo");
export type SvgoOptions = {
  /**
   * The encode options
   */
  encodeOptions?: SvgoEncodeOptions | undefined;
};
export type SvgoEncodeOptions = Omit<import("svgo").Config, "path" | "datauri">;
export type Uint8ArrayUtf8ByteString = (
  array: number[] | Uint8Array,
  start: number,
  end: number,
) => string;
export type StringToBytes = (string: string) => number[];
export type MetaData = {
  /**
   * The warnings array
   */
  warnings: Array<Error>;
  /**
   * The errors array
   */
  errors: Array<Error>;
};
export type SharpLib = typeof import("sharp");
export type Sharp = import("sharp").Sharp;
export type ResizeOptions = import("sharp").ResizeOptions & {
  enabled?: boolean;
  unit?: "px" | "percent";
};
export type SharpEncodeOptions = {
  /**
   * The AVIF options
   */
  avif?: import("sharp").AvifOptions | undefined;
  /**
   * The GIF options
   */
  gif?: import("sharp").GifOptions | undefined;
  /**
   * The HEIF options
   */
  heif?: import("sharp").HeifOptions | undefined;
  /**
   * The JPEG options
   */
  jpeg?: import("sharp").JpegOptions | undefined;
  /**
   * The JPG options
   */
  jpg?: import("sharp").JpegOptions | undefined;
  /**
   * The PNG options
   */
  png?: import("sharp").PngOptions | undefined;
  /**
   * The WebP options
   */
  webp?: import("sharp").WebpOptions | undefined;
};
export type SharpFormat = keyof SharpEncodeOptions;
export type SharpOptions = {
  /**
   * The resize options
   */
  resize?: ResizeOptions | undefined;
  /**
   * The rotate options
   */
  rotate?: (number | "auto") | undefined;
  /**
   * The size suffix
   */
  sizeSuffix?: SizeSuffix | undefined;
  /**
   * The encode options
   */
  encodeOptions?: SharpEncodeOptions | undefined;
};
export type SizeSuffix = (width: number, height: number) => string;
export const ABSOLUTE_URL_REGEX: RegExp;
/** @type {WeakMap<Module, AssetInfo>} */
export const IMAGE_MINIMIZER_PLUGIN_INFO_MAPPINGS: WeakMap<Module, AssetInfo>;
export const WINDOWS_PATH_REGEX: RegExp;
/**
 * @template T
 * @param {WorkerResult} original The original worker result
 * @param {T} minimizerOptions The minimizer options
 * @returns {Promise<WorkerResult | null>} The generated result
 */
export function imageminGenerate<T>(
  original: WorkerResult,
  minimizerOptions: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original The original worker result
 * @param {T} options The options
 * @returns {Promise<WorkerResult | null>} The minified result
 */
export function imageminMinify<T>(
  original: WorkerResult,
  options: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {ImageminOptions} imageminConfig The imagemin configuration
 * @returns {Promise<ImageminOptions>} The normalized configuration
 */
export function imageminNormalizeConfig<T>(
  imageminConfig: ImageminOptions,
): Promise<ImageminOptions>;
/**
 * @param {string} url The URL to check
 * @returns {boolean} Whether the URL is absolute
 */
export function isAbsoluteURL(url: string): boolean;
/**
 * @template T
 * @param {(() => unknown) | undefined} fn The function to memoize
 * @returns {() => T} The memoized function
 */
export function memoize<T>(fn: (() => unknown) | undefined): () => T;
/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").SquooshOptions} SquooshOptions */
/** @typedef {import("imagemin").Options} ImageminOptions */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").AssetInfo} AssetInfo */
/**
 * @template T
 * @typedef {() => Promise<T>} Task
 */
/**
 * @param {string} filename file path without query params (e.g. `path/img.png`)
 * @param {string} ext new file extension without `.` (e.g. `webp`)
 * @returns {string} new filename `path/img.png` -> `path/img.webp`
 */
export function replaceFileExtension(filename: string, ext: string): string;
/**
 * @template T
 * @param {WorkerResult} original The original worker result
 * @param {T} minimizerOptions The minimizer options
 * @returns {Promise<WorkerResult | null>} The generated result
 */
export function sharpGenerate<T>(
  original: WorkerResult,
  minimizerOptions: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original The original worker result
 * @param {T} minimizerOptions The minimizer options
 * @returns {Promise<WorkerResult | null>} The minified result
 */
export function sharpMinify<T>(
  original: WorkerResult,
  minimizerOptions: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original The original worker result
 * @param {T} minifyOptions The minify options
 * @returns {Promise<WorkerResult | null>} The generated result
 */
export function squooshGenerate<T>(
  original: WorkerResult,
  minifyOptions: T,
): Promise<WorkerResult | null>;
export namespace squooshGenerate {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
/**
 * @template T
 * @param {WorkerResult} original The original worker result
 * @param {T} options The options
 * @returns {Promise<WorkerResult | null>} The minified result
 */
export function squooshMinify<T>(
  original: WorkerResult,
  options: T,
): Promise<WorkerResult | null>;
export namespace squooshMinify {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
/** @typedef {import("svgo")} SvgoLib */
/**
 * @typedef SvgoOptions
 * @property {SvgoEncodeOptions=} encodeOptions The encode options
 */
/** @typedef {Omit<import("svgo").Config, "path" | "datauri">} SvgoEncodeOptions */
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minimizerOptions
 * @returns {Promise<WorkerResult | null>}
 */
/**
 * @param {WorkerResult} original The original worker result
 * @param {SvgoOptions} minimizerOptions The minimizer options
 * @returns {Promise<WorkerResult | null>} The minified result
 */
export function svgoMinify(
  original: WorkerResult,
  minimizerOptions: SvgoOptions,
): Promise<WorkerResult | null>;
/**
 * Run tasks with limited concurrency.
 * @template T
 * @param {number} limit Limit of tasks that run at once.
 * @param {Task<T>[]} tasks List of tasks to run.
 * @returns {Promise<T[]>} A promise that fulfills to an array of the results
 */
export function throttleAll<T>(limit: number, tasks: Task<T>[]): Promise<T[]>;
/**
 * Sets up the squoosh image pool
 */
declare function squooshImagePoolSetup(): void;
/**
 * Tears down the squoosh image pool
 */
declare function squooshImagePoolTeardown(): Promise<void>;
export {};
