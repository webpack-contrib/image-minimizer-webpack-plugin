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
/**
 * @param {WorkerResult} original
 * @param {SharpOptions} [minimizerOptions]
 * @returns {Promise<WorkerResult>}
 */
export function sharpMinify(
  original: WorkerResult,
  minimizerOptions?: SharpOptions | undefined
): Promise<WorkerResult>;
/**
 * @param {WorkerResult} original
 * @param {SharpOptions} minimizerOptions
 * @returns {Promise<WorkerResult>}
 */
export function sharpGenerate(
  original: WorkerResult,
  minimizerOptions: SharpOptions
): Promise<WorkerResult>;
declare function squooshImagePoolSetup(): void;
declare function squooshImagePoolTeardown(): Promise<void>;
export {};
