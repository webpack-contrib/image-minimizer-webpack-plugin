export = worker;
/**
 * @template T
 * @param {import("./index").InternalWorkerOptions<T>} options The worker options
 * @returns {Promise<WorkerResult>} The worker result
 */
declare function worker<T>(
  options: import("./index").InternalWorkerOptions<T>,
): Promise<WorkerResult>;
declare namespace worker {
  export { WorkerResult, FilenameFn };
}
type WorkerResult = import("./index").WorkerResult;
type FilenameFn = import("./index").FilenameFn;
