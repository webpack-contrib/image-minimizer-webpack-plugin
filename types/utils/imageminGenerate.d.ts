export default imageminGenerate;
export type ImageminMinimizerOptions =
  import("../index").ImageminMinimizerOptions;
export type WorkerResult = import("../index").WorkerResult;
export type ImageminOptions = import("imagemin").Options;
/** @typedef {import("../index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("../index").WorkerResult} WorkerResult */
/** @typedef {import("imagemin").Options} ImageminOptions */
/**
 * @param {WorkerResult} original
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<WorkerResult[]>}
 */
declare function imageminGenerate(
  original: WorkerResult,
  minimizerOptions: ImageminMinimizerOptions
): Promise<WorkerResult[]>;
