export default imageminMinify;
export type DataForMinifyFn = import("../index").DataForMinifyFn;
export type ImageminMinimizerOptions =
  import("../index").ImageminMinimizerOptions;
export type MinifyResult = import("../index").MinifyResult;
export type ImageminOptions = import("imagemin").Options;
export type MetaData = {
  warnings: Array<Error>;
  errors: Array<Error>;
};
/**
 * @param {MinifyResult} original
 * @param {ImageminMinimizerOptions} options
 * @returns {Promise<MinifyResult>}
 */
declare function imageminMinify(
  original: MinifyResult,
  options: ImageminMinimizerOptions
): Promise<MinifyResult>;
/**
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @param {MetaData} [metaData]
 */
export function imageminNormalizeConfig(
  minimizerOptions: ImageminMinimizerOptions,
  metaData?: MetaData | undefined
): import("../index").ImageminMinimizerOptions;
