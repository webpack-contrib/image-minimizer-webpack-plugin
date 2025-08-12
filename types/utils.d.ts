export type WorkerResult = import("./index").WorkerResult;
export type SquooshOptions = import("./index").SquooshOptions;
export type ImageminOptions = import("imagemin").Options;
export type WebpackError = import("webpack").WebpackError;
export type Module = import("webpack").Module;
export type AssetInfo = import("webpack").AssetInfo;
export type Task<T> = () => Promise<T>;
export type FunctionReturning<T> = () => T;
export type SvgoLib = typeof import("svgo");
export type SvgoEncodeOptions = Omit<import("svgo").Config, "path" | "datauri">;
export type SvgoOptions = {
  /**
   * encode options
   */
  encodeOptions?: SvgoEncodeOptions | undefined;
};
export type Uint8ArrayUtf8ByteString = (
  array: number[] | Uint8Array,
  start: number,
  end: number,
) => string;
export type StringToBytes = (string: string) => number[];
export type MetaData = {
  /**
   * warnings
   */
  warnings: Array<Error>;
  /**
   * errors
   */
  errors: Array<Error>;
};
export type SquooshImage = {
  /**
   * preprocess
   */
  preprocess: (options: Record<string, unknown>) => Promise<void>;
  /**
   * encode
   */
  encode: (options: Record<string, unknown>) => Promise<void>;
  /**
   * encoded with
   */
  encodedWith: Record<
    string,
    {
      binary: Uint8Array;
      extension: string;
    }
  >;
  /**
   * decoded
   */
  decoded: {
    bitmap: {
      width: number;
      height: number;
    };
  };
};
export type SquooshImagePool = {
  /**
   * ingest image function
   */
  ingestImage: (data: Uint8Array) => SquooshImage;
  /**
   * close function
   */
  close: () => Promise<void>;
};
export type SharpLib = typeof import("sharp");
export type Sharp = import("sharp").Sharp;
export type ResizeOptions = import("sharp").ResizeOptions & {
  enabled?: boolean;
  unit?: "px" | "percent";
};
export type SharpEncodeOptions = {
  /**
   * AVIF options
   */
  avif?: import("sharp").AvifOptions | undefined;
  /**
   * GIF options
   */
  gif?: import("sharp").GifOptions | undefined;
  /**
   * HEIF options
   */
  heif?: import("sharp").HeifOptions | undefined;
  /**
   * JPEG options
   */
  jpeg?: import("sharp").JpegOptions | undefined;
  /**
   * JPG options
   */
  jpg?: import("sharp").JpegOptions | undefined;
  /**
   * PNG options
   */
  png?: import("sharp").PngOptions | undefined;
  /**
   * WebP options
   */
  webp?: import("sharp").WebpOptions | undefined;
};
export type SharpFormat = keyof SharpEncodeOptions;
export type SharpOptions = {
  /**
   * resize options
   */
  resize?: ResizeOptions | undefined;
  /**
   * rotate options
   */
  rotate?: (number | "auto") | undefined;
  /**
   * size suffix
   */
  sizeSuffix?: SizeSuffix | undefined;
  /**
   * encode options
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
 * @param {WorkerResult} original original worker result
 * @param {T} minimizerOptions minimizer options
 * @returns {Promise<WorkerResult | null>} generated result
 */
export function imageminGenerate<T>(
  original: WorkerResult,
  minimizerOptions: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original original worker result
 * @param {T} options options
 * @returns {Promise<WorkerResult | null>} minified result
 */
export function imageminMinify<T>(
  original: WorkerResult,
  options: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {ImageminOptions} imageminConfig imagemin configuration
 * @returns {Promise<ImageminOptions>} normalized imagemin configuration
 */
export function imageminNormalizeConfig<T>(
  imageminConfig: ImageminOptions,
): Promise<ImageminOptions>;
/**
 * @param {string} url URL
 * @returns {boolean} true when URL is absolute, otherwise false
 */
export function isAbsoluteURL(url: string): boolean;
/**
 * @template T
 * @typedef {() => T} FunctionReturning
 */
/**
 * @template T
 * @param {FunctionReturning<T>} fn memorized function
 * @returns {FunctionReturning<T>} new function
 */
export function memoize<T>(fn: FunctionReturning<T>): FunctionReturning<T>;
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
 * @param {WorkerResult} original original worker result
 * @param {T} minimizerOptions minify options
 * @returns {Promise<WorkerResult | null>} generated result
 */
export function sharpGenerate<T>(
  original: WorkerResult,
  minimizerOptions: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original original worker result
 * @param {T} minimizerOptions minify options
 * @returns {Promise<WorkerResult | null>} minified result
 */
export function sharpMinify<T>(
  original: WorkerResult,
  minimizerOptions: T,
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original original worker result
 * @param {T} minifyOptions minify options
 * @returns {Promise<WorkerResult | null>} generated result
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
 * @param {WorkerResult} original original worker result
 * @param {T} options minify options
 * @returns {Promise<WorkerResult | null>} minified result
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
/** @typedef {Omit<import("svgo").Config, "path" | "datauri">} SvgoEncodeOptions */
/**
 * @typedef {object} SvgoOptions
 * @property {SvgoEncodeOptions=} encodeOptions encode options
 */
/**
 * @template T
 * @param {WorkerResult} original original worker result
 * @param {T} minimizerOptions minify options
 * @returns {Promise<WorkerResult | null>} minified result
 */
export function svgoMinify<T>(
  original: WorkerResult,
  minimizerOptions: T,
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
 * @returns {void}
 */
declare function squooshImagePoolSetup(): void;
/**
 * @returns {Promise<void>}
 */
declare function squooshImagePoolTeardown(): Promise<void>;
export {};
