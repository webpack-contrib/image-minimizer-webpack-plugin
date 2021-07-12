export default imageminGenerate;
export type DataForMinifyFn = import("../index").DataForMinifyFn;
export type ImageminMinimizerOptions =
  import("../index").ImageminMinimizerOptions;
export type MinifyFnResult = import("../index").MinifyFnResult;
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */
/**
 * @param {MinifyFnResult} original
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<MinifyFnResult[]>}
 */
declare function imageminGenerate(
  original: MinifyFnResult,
  minimizerOptions: ImageminMinimizerOptions
): Promise<MinifyFnResult[]>;
