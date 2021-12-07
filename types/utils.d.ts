export type Task<T> = () => Promise<T>;
export type WorkerResult = import("./index").WorkerResult;
export type SquooshOptions = import("./index").SquooshOptions;
export type ImageminOptions = import("imagemin").Options;
export type WebpackError = import("webpack").WebpackError;
export type Uint8ArrayUtf8ByteString = (
  array: number[] | Uint8Array,
  start: number,
  end: number
) => string;
export type StringToBytes = (string: string) => number[];
export type MetaData = {
  warnings: Array<Error>;
  errors: Array<Error>;
};
/**
 * @template T
 * @typedef {() => Promise<T>} Task
 */
/**
 * Run tasks with limited concurency.
 * @template T
 * @param {number} limit - Limit of tasks that run at once.
 * @param {Task<T>[]} tasks - List of tasks to run.
 * @returns {Promise<T[]>} A promise that fulfills to an array of the results
 */
export function throttleAll<T>(limit: number, tasks: Task<T>[]): Promise<T[]>;
/**
 * @param {string} url
 * @returns {boolean}
 */
export function isAbsoluteURL(url: string): boolean;
/**
 * @template T
 * @param {ImageminOptions} imageminConfig
 * @returns {Promise<ImageminOptions>}
 */
export function imageminNormalizeConfig<T>(
  imageminConfig: ImageminOptions
): Promise<ImageminOptions>;
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} options
 * @returns {Promise<WorkerResult>}
 */
export function imageminMinify<T>(
  original: WorkerResult,
  options: T
): Promise<WorkerResult>;
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minimizerOptions
 * @returns {Promise<WorkerResult>}
 */
export function imageminGenerate<T>(
  original: WorkerResult,
  minimizerOptions: T
): Promise<WorkerResult>;
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} options
 * @returns {Promise<WorkerResult>}
 */
export function squooshMinify<T>(
  original: WorkerResult,
  options: T
): Promise<WorkerResult>;
export namespace squooshMinify {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minifyOptions
 * @returns {Promise<WorkerResult>}
 */
export function squooshGenerate<T>(
  original: WorkerResult,
  minifyOptions: T
): Promise<WorkerResult>;
export namespace squooshGenerate {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
declare function squooshImagePoolSetup(): void;
declare function squooshImagePoolTeardown(): Promise<void>;
export {};
