/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").FilenameFn} FilenameFn */

/**
 * @template T
 * @param {import("./index").InternalWorkerOptions<T>} options
 * @param {WorkerResult} item
 * @param {undefined | string | FilenameFn} filename
 * @returns {WorkerResult}
 */
function normalizeProcessedResult(options, item, filename) {
  item.info ??= {};
  item.filename ??= options.filename;
  item.errors ??= [];
  item.warnings ??= [];

  if (options.severityError === "off") {
    item.warnings = [];
    item.errors = [];
  } else if (options.severityError === "warning") {
    item.warnings = [...item.warnings, ...item.errors];
    item.errors = [];
  }

  if (
    typeof filename !== "undefined" &&
    typeof options.generateFilename === "function" &&
    !item.info.original
  ) {
    item.filename = options.generateFilename(filename, {
      filename: item.filename,
    });
  }

  delete item.info.original;

  return item;
}

/**
 * @template T
 * @param {import("./index").InternalWorkerOptions<T>} options
 * @returns {Promise<WorkerResult>}
 */
async function worker(options) {
  /** @type {WorkerResult} */
  let result = {
    data: options.input,
    filename: options.filename,
    warnings: [],
    errors: [],
    info: {},
  };

  if (!result.data) {
    result.errors.push(new Error("Empty input"));

    return result;
  }

  const transformers = Array.isArray(options.transformer)
    ? options.transformer
    : [options.transformer];

  for await (const transformer of transformers) {
    if (
      typeof transformer.filter === "function" &&
      !transformer.filter(options.input, options.filename)
    ) {
      continue;
    }

    /** @type {WorkerResult} */
    let processedResult;

    try {
      processedResult = await transformer.implementation(
        result,
        transformer.options
      );
    } catch (error) {
      result.errors.push(
        error instanceof Error
          ? error
          : new Error(/** @type {string} */ (error))
      );

      return result;
    }

    if (!processedResult || !Buffer.isBuffer(processedResult.data)) {
      result.errors.push(
        new Error(
          "minimizer function doesn't return the 'data' property or result is not a 'Buffer' value"
        )
      );

      return result;
    }

    result = normalizeProcessedResult(
      options,
      processedResult,
      transformer.filename
    );
  }

  return result;
}

module.exports = worker;
