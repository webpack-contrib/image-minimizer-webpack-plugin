/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").FilenameFn} FilenameFn */
/**
 * @template T
 * @param {import("./index").InternalWorkerOptions<T>} options
 * @returns {Promise<WorkerResult>}
 */
export default function worker<T>(
  options: import("./index").InternalWorkerOptions<T>
): Promise<WorkerResult>;
export type WorkerResult = import("./index").WorkerResult;
export type FilenameFn = import("./index").FilenameFn;
