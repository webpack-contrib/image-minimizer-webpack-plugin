export default squooshMinify;
export type WebpackError = import("webpack").WebpackError;
export type SquooshMinimizerOptions =
  import("../index").SquooshMinimizerOptions;
export type WorkerResult = import("../index").WorkerResult;
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").WorkerResult} WorkerResult */
/**
 * @param {WorkerResult} original
 * @param {SquooshMinimizerOptions} options
 * @returns {Promise<WorkerResult>}
 */
declare function squooshMinify(
  original: WorkerResult,
  options: SquooshMinimizerOptions
): Promise<WorkerResult>;
