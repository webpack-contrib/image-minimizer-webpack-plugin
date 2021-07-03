export = minify;
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */
/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<MinifyFnResult[]>}
 */
declare function minify(
  options: InternalMinifyOptions
): Promise<MinifyFnResult[]>;
declare namespace minify {
  export {
    MinimizerOptions,
    MinifyFunctions,
    InternalMinifyOptions,
    MinifyFnResult,
  };
}
type InternalMinifyOptions = import("./index").InternalMinifyOptions;
type MinifyFnResult = import("./index").MinifyFnResult;
type MinimizerOptions = import("./index").MinimizerOptions;
type MinifyFunctions = import("./index").MinifyFunctions;
