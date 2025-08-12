export = worker;
/**
 * @template T
 * @param {import("./index").InternalWorkerOptions<T>} options worker options
 * @returns {Promise<WorkerResult>} worker result
 */
declare function worker<T>(
  options: import("./index").InternalWorkerOptions<T>,
): Promise<WorkerResult>;
declare namespace worker {
  export { isFilenameProcessed, WorkerResult, FilenameFn };
}
/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").FilenameFn} FilenameFn */
/** @type {unique symbol} */
declare const isFilenameProcessed: unique symbol;
type WorkerResult = import("./index").WorkerResult;
type FilenameFn = import("./index").FilenameFn;
