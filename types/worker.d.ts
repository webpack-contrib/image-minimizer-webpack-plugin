export = worker;
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalWorkerOptions} InternalWorkerOptions */
/** @typedef {import("./index").WorkerResult} WorkerResult */
/**
 * @param {InternalWorkerOptions} options
 * @returns {Promise<WorkerResult>}
 */
declare function worker(options: InternalWorkerOptions): Promise<WorkerResult>;
declare namespace worker {
  export {
    MinimizerOptions,
    MinifyFunctions,
    InternalWorkerOptions,
    WorkerResult,
  };
}
type InternalWorkerOptions = import("./index").InternalWorkerOptions;
type WorkerResult = import("./index").WorkerResult;
type MinimizerOptions = import("./index").MinimizerOptions;
type MinifyFunctions = import("./index").MinifyFunctions;
