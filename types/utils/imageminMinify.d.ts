export default imageminMinify;
export type DataForMinifyFn = import("../index").DataForMinifyFn;
export type ImageminMinimizerOptions =
  import("../index").ImageminMinimizerOptions;
export type MinifyFnResult = import("../index").MinifyFnResult;
export type ImageminOptions = import("imagemin").Options;
export type MetaData = {
  warnings: Array<Error>;
  errors: Array<Error>;
};
/**
 * @param {DataForMinifyFn} data
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<MinifyFnResult>}
 */
declare function imageminMinify(
  data: DataForMinifyFn,
  minimizerOptions: ImageminMinimizerOptions
): Promise<MinifyFnResult>;
/**
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @param {MetaData} [metaData]
 */
export function imageminNormalizeConfig(
  minimizerOptions: ImageminMinimizerOptions,
  metaData?: MetaData | undefined
): import("../index").ImageminMinimizerOptions;
