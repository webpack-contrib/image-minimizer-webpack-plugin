/**
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @param {MetaData} [metaData]
 */
export function normalizeImageminConfig(
  minimizerOptions: ImageminMinimizerOptions,
  metaData?: MetaData | undefined
): import("../index").ImageminMinimizerOptions;
/**
 * @param {DataForMinifyFn} data
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<MinifyFnResult>}
 */
export default function imageminMinify(
  data: DataForMinifyFn,
  minimizerOptions: ImageminMinimizerOptions
): Promise<MinifyFnResult>;
export type DataForMinifyFn = import("../index").DataForMinifyFn;
export type ImageminMinimizerOptions =
  import("../index").ImageminMinimizerOptions;
export type MinifyFnResultEntry = import("../index").MinifyFnResultEntry;
export type MinifyFnResult = import("../index").MinifyFnResult;
export type MetaData = {
  warnings: Array<Error>;
  errors: Array<Error>;
};
