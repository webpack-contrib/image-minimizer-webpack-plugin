export default squooshGenerate;
export type WorkerResult = import("../index").WorkerResult;
export type SquooshMinimizerOptions =
  import("../index").SquooshMinimizerOptions;
export type ImageminOptions = import("imagemin").Options;
/** @typedef {import("../index").WorkerResult} WorkerResult */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("imagemin").Options} ImageminOptions */
/**
 * @param {WorkerResult} original
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<WorkerResult[]>}
 */
declare function squooshGenerate(
  original: WorkerResult,
  minifyOptions: SquooshMinimizerOptions
): Promise<WorkerResult[]>;
