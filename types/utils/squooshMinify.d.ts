export default squooshMinify;
export type WebpackError = import("webpack").WebpackError;
export type DataForMinifyFn = import("../index").DataForMinifyFn;
export type SquooshMinimizerOptions =
  import("../index").SquooshMinimizerOptions;
export type MinifyFnResult = import("../index").MinifyFnResult;
/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */
/**
 * @param {MinifyFnResult} original
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<MinifyFnResult>}
 */
declare function squooshMinify(
  original: MinifyFnResult,
  minifyOptions: SquooshMinimizerOptions
): Promise<MinifyFnResult>;
