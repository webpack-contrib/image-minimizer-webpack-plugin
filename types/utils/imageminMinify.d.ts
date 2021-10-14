export default imageminMinify;
export type ImageminMinimizerOptions =
  import("../index").ImageminMinimizerOptions;
export type WorkerResult = import("../index").WorkerResult;
export type ImageminOptions = import("imagemin").Options;
export type MetaData = {
  warnings: Array<Error>;
  errors: Array<Error>;
};
/**
 * @param {WorkerResult} original
 * @param {ImageminMinimizerOptions} options
 * @returns {Promise<WorkerResult>}
 */
declare function imageminMinify(
  original: WorkerResult,
  options: ImageminMinimizerOptions
): Promise<WorkerResult>;
/**
 * @param {ImageminMinimizerOptions} minimizerOptions
 */
export function imageminNormalizeConfig(
  minimizerOptions: ImageminMinimizerOptions
): import("../index").ImageminMinimizerOptions;
