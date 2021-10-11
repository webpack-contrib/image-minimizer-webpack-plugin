export default squooshMinify;
export type WebpackError = import("webpack").WebpackError;
export type DataForMinifyFn = import("../index").DataForMinifyFn;
export type SquooshMinimizerOptions =
  import("../index").SquooshMinimizerOptions;
export type MinifyResult = import("../index").MinifyResult;
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").MinifyResult} MinifyResult */
/**
 * @param {MinifyResult} original
 * @param {SquooshMinimizerOptions} options
 * @returns {Promise<MinifyResult>}
 */
declare function squooshMinify(
  original: MinifyResult,
  options: SquooshMinimizerOptions
): Promise<MinifyResult>;
