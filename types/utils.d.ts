export type WorkerResult = import("./index").WorkerResult;
export type SquooshOptions = import("./index").SquooshOptions;
export type ImageminOptions = import("imagemin").Options;
export type WebpackError = import("webpack").WebpackError;
export type Task<T> = () => Promise<T>;
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
export type SharpLib = typeof import("sharp");
export type Sharp = import("sharp").Sharp;
export type ResizeOptions = import("sharp").ResizeOptions & {
  enabled?: boolean;
};
export type SharpEncodeOptions = {
  avif?: import("sharp").AvifOptions | undefined;
  gif?: import("sharp").GifOptions | undefined;
  heif?: import("sharp").HeifOptions | undefined;
  jpeg?: import("sharp").JpegOptions | undefined;
  jpg?: import("sharp").JpegOptions | undefined;
  png?: import("sharp").PngOptions | undefined;
  webp?: import("sharp").WebpOptions | undefined;
};
export type SharpFormat = keyof SharpEncodeOptions;
export type SharpOptions = {
  resize?: ResizeOptions | undefined;
  rotate?: number | "auto" | undefined;
  sizeSuffix?: SizeSuffix | undefined;
  encodeOptions?: SharpEncodeOptions | undefined;
};
export type SizeSuffix = (width: number, height: number) => string;
/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").SquooshOptions} SquooshOptions */
/** @typedef {import("imagemin").Options} ImageminOptions */
/** @typedef {import("webpack").WebpackError} WebpackError */
/**
 * @template T
 * @typedef {() => Promise<T>} Task
 */
/**
 * Run tasks with limited concurrency.
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
 * @returns {Promise<WorkerResult | null>}
 */
export function imageminMinify<T>(
  original: WorkerResult,
  options: T
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minimizerOptions
 * @returns {Promise<WorkerResult | null>}
 */
export function imageminGenerate<T>(
  original: WorkerResult,
  minimizerOptions: T
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} options
 * @returns {Promise<WorkerResult | null>}
 */
export function squooshMinify<T>(
  original: WorkerResult,
  options: T
): Promise<WorkerResult | null>;
export namespace squooshMinify {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minifyOptions
 * @returns {Promise<WorkerResult | null>}
 */
export function squooshGenerate<T>(
  original: WorkerResult,
  minifyOptions: T
): Promise<WorkerResult | null>;
export namespace squooshGenerate {
  export { squooshImagePoolSetup as setup };
  export { squooshImagePoolTeardown as teardown };
}
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minimizerOptions
 * @returns {Promise<WorkerResult | null>}
 */
export function sharpMinify<T>(
  original: WorkerResult,
  minimizerOptions: T
): Promise<WorkerResult | null>;
/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minimizerOptions
 * @returns {Promise<WorkerResult | null>}
 */
export function sharpGenerate<T>(
  original: WorkerResult,
  minimizerOptions: T
): Promise<WorkerResult | null>;
declare function squooshImagePoolSetup(): void;
declare function squooshImagePoolTeardown(): Promise<void>;
export {};
