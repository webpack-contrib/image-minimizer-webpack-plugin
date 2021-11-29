export type ImageminMinimizerOptions =
  import("./index").ImageminMinimizerOptions;
export type WorkerResult = import("./index").WorkerResult;
export type SquooshMinimizerOptions = import("./index").SquooshMinimizerOptions;
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
 * @param {ImageminMinimizerOptions} minimizerOptions
 */
export function imageminNormalizeConfig(
  minimizerOptions: ImageminMinimizerOptions
): import("./index").ImageminMinimizerOptions;
/**
 * @param {WorkerResult} original
 * @param {ImageminMinimizerOptions} options
 * @returns {Promise<WorkerResult>}
 */
export function imageminMinify(
  original: WorkerResult,
  options: ImageminMinimizerOptions
): Promise<WorkerResult>;
/**
 * @param {WorkerResult} original
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<WorkerResult[]>}
 */
export function imageminGenerate(
  original: WorkerResult,
  minimizerOptions: ImageminMinimizerOptions
): Promise<WorkerResult[]>;
/**
 * @param {WorkerResult} original
 * @param {SquooshMinimizerOptions} options
 * @returns {Promise<WorkerResult>}
 */
export function squooshMinify(
  original: WorkerResult,
  options: SquooshMinimizerOptions
): Promise<WorkerResult>;
/**
 * @param {WorkerResult} original
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<WorkerResult[]>}
 */
export function squooshGenerate(
  original: WorkerResult,
  minifyOptions: SquooshMinimizerOptions
): Promise<WorkerResult[]>;
