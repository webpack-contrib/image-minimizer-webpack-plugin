export = minify;
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyResult} MinifyResult */
/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<MinifyResult>}
 */
declare function minify(options: InternalMinifyOptions): Promise<MinifyResult>;
declare namespace minify {
  export {
    MinimizerOptions,
    MinifyFunctions,
    InternalMinifyOptions,
    MinifyResult,
  };
}
type InternalMinifyOptions = import("./index").InternalMinifyOptions;
type MinifyResult = import("./index").MinifyResult;
type MinimizerOptions = import("./index").MinimizerOptions;
type MinifyFunctions = import("./index").MinifyFunctions;
