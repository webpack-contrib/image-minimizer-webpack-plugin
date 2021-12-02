export = worker;
/** @typedef {import("./index").InternalWorkerOptions} InternalWorkerOptions */
/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").FilenameFn} FilenameFn */
/**
 * @param {InternalWorkerOptions} options
 * @returns {Promise<WorkerResult>}
 */
declare function worker(options: InternalWorkerOptions): Promise<WorkerResult>;
declare namespace worker {
  export { InternalWorkerOptions, WorkerResult, FilenameFn };
}
type InternalWorkerOptions = import("./index").InternalWorkerOptions;
type WorkerResult = import("./index").WorkerResult;
type FilenameFn = import("./index").FilenameFn;
