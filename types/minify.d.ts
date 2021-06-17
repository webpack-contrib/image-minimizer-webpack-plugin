export = minify;
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyResultEntry} InternalMinifyResultEntry */
/** @typedef {import("./index").InternalMinifyResult} InternalMinifyResult */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResultEntry} MinifyFnResultEntry */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */
/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<InternalMinifyResult>}
 */
declare function minify(
  options: InternalMinifyOptions
): Promise<import("./index").InternalMinifyResult>;
declare namespace minify {
  export {
    MinifyFunctions,
    InternalMinifyResultEntry,
    InternalMinifyResult,
    InternalMinifyOptions,
    MinifyFnResultEntry,
    MinifyFnResult,
  };
}
type InternalMinifyOptions = import("./index").InternalMinifyOptions;
type MinifyFunctions = import("./index").MinifyFunctions;
type InternalMinifyResultEntry = import("./index").InternalMinifyResultEntry;
type InternalMinifyResult = import("./index").InternalMinifyResult;
type MinifyFnResultEntry = import("./index").MinifyFnResultEntry;
type MinifyFnResult = import("./index").MinifyFnResult;
