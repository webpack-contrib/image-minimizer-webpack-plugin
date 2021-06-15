/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */
/** @typedef {import("../index").MinifyFnResultEntry} MinifyFnResultEntry */
/**
 * @param {DataForMinifyFn} data
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<MinifyFnResult>}
 */
export default function imageminGenerate(
  data: DataForMinifyFn,
  minimizerOptions: ImageminMinimizerOptions
): Promise<MinifyFnResult>;
export type DataForMinifyFn = import("../index").DataForMinifyFn;
export type ImageminMinimizerOptions =
  import("../index").ImageminMinimizerOptions;
export type MinifyFnResult = import("../index").MinifyFnResult;
export type MinifyFnResultEntry = import("../index").MinifyFnResultEntry;
