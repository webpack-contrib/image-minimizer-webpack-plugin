export = minify;
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyResult} InternalMinifyResult */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */
/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<InternalMinifyResult>}
 */
declare function minify(
  options: InternalMinifyOptions
): Promise<InternalMinifyResult>;
declare namespace minify {
  export {
    MinimizerOptions,
    MinifyFunctions,
    InternalMinifyResult,
    InternalMinifyOptions,
    MinifyFnResult,
  };
}
type InternalMinifyOptions = import("./index").InternalMinifyOptions;
type InternalMinifyResult = import("./index").InternalMinifyResult;
type MinimizerOptions = import("./index").MinimizerOptions;
type MinifyFunctions = import("./index").MinifyFunctions;
type MinifyFnResult = import("./index").MinifyFnResult;
