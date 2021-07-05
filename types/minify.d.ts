export = minify;
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */
/** @typedef {import("./index").ImageminMinifyFunction} ImageminMinifyFunction */
/** @typedef {import("./index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("./index").SquooshMinifyFunction} SquooshMinifyFunction */
/** @typedef {import("./index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("./index").CustomMinifyFunction} CustomMinifyFunction */
/** @typedef {import("./index").CustomFnMinimizerOptions} CustomFnMinimizerOptions */
/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<MinifyFnResult[]>}
 */
declare function minify(options: InternalMinifyOptions): Promise<MinifyFnResult[]>;
declare namespace minify {
    export { MinimizerOptions, MinifyFunctions, InternalMinifyOptions, MinifyFnResult, ImageminMinifyFunction, ImageminMinimizerOptions, SquooshMinifyFunction, SquooshMinimizerOptions, CustomMinifyFunction, CustomFnMinimizerOptions };
}
type InternalMinifyOptions = import("./index").InternalMinifyOptions;
type MinifyFnResult = import("./index").MinifyFnResult;
type MinimizerOptions = import("./index").MinimizerOptions;
type MinifyFunctions = import("./index").MinifyFunctions;
type ImageminMinifyFunction = import("./index").ImageminMinifyFunction;
type ImageminMinimizerOptions = import("./index").ImageminMinimizerOptions;
type SquooshMinifyFunction = import("./index").SquooshMinifyFunction;
type SquooshMinimizerOptions = import("./index").SquooshMinimizerOptions;
type CustomMinifyFunction = import("./index").CustomMinifyFunction;
type CustomFnMinimizerOptions = import("./index").CustomFnMinimizerOptions;
