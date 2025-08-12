export type WorkerResult = import("./index").WorkerResult;
export type CustomOptions = import("./index").CustomOptions;
export type WebpackError = import("webpack").WebpackError;
export type Module = import("webpack").Module;
export type AssetInfo = import("webpack").AssetInfo;
export type EXPECTED_ANY = any;
export type Task<T> = () => Promise<T>;
export type FunctionReturning<T> = () => T;
export type CustomSharpFormat = EXPECTED_ANY;
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
export type SizeSuffix = (width: number, height: number) => string;
export const ABSOLUTE_URL_REGEX: RegExp;
/** @type {WeakMap<Module, AssetInfo>} */
export const IMAGE_MINIMIZER_PLUGIN_INFO_MAPPINGS: WeakMap<Module, AssetInfo>;
export const WINDOWS_PATH_REGEX: RegExp;
/**
 * @param {WorkerResult} original original worker result
 * @param {CustomOptions=} options options
 * @returns {Promise<WorkerResult | null>} generated result
 */
export function imageminGenerate(
  original: WorkerResult,
  options?: CustomOptions | undefined,
): Promise<WorkerResult | null>;
/**
 * @param {WorkerResult} original original worker result
 * @param {CustomOptions=} options options
 * @returns {Promise<WorkerResult | null>} minified result
 */
export function imageminMinify(
  original: WorkerResult,
  options?: CustomOptions | undefined,
): Promise<WorkerResult | null>;
/**
 * @param {Record<string, EXPECTED_ANY>} imageminConfig imagemin configuration
 * @returns {Promise<Record<string, EXPECTED_ANY>>} normalized imagemin configuration
 */
export function imageminNormalizeConfig(
  imageminConfig: Record<string, EXPECTED_ANY>,
): Promise<Record<string, EXPECTED_ANY>>;
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
/** @typedef {import("./index").CustomOptions} CustomOptions */
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").AssetInfo} AssetInfo */
/** @typedef {any} EXPECTED_ANY */
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
 * @param {WorkerResult} original original worker result
 * @param {CustomOptions=} options options
 * @returns {Promise<WorkerResult | null>} generated result
 */
export function sharpGenerate(
  original: WorkerResult,
  options?: CustomOptions | undefined,
): Promise<WorkerResult | null>;
/**
 * @param {WorkerResult} original original worker result
 * @param {CustomOptions=} options options
 * @returns {Promise<WorkerResult | null>} minified result
 */
export function sharpMinify(
  original: WorkerResult,
  options?: CustomOptions | undefined,
): Promise<WorkerResult | null>;
/**
 * @param {WorkerResult} original original worker result
 * @param {CustomOptions=} options options
 * @returns {Promise<WorkerResult | null>} generated result
 */
export function squooshGenerate(
  original: WorkerResult,
  options?: CustomOptions | undefined,
): Promise<WorkerResult | null>;
export namespace squooshGenerate {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
/**
 * @param {WorkerResult} original original worker result
 * @param {CustomOptions=} options options
 * @returns {Promise<WorkerResult | null>} minified result
 */
export function squooshMinify(
  original: WorkerResult,
  options?: CustomOptions | undefined,
): Promise<WorkerResult | null>;
export namespace squooshMinify {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
/**
 * @param {WorkerResult} original original worker result
 * @param {CustomOptions=} options options
 * @returns {Promise<WorkerResult | null>} minified result
 */
export function svgoMinify(
  original: WorkerResult,
  options?: CustomOptions | undefined,
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
