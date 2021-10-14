/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalWorkerOptions} InternalWorkerOptions */
/** @typedef {import("./index").WorkerResult} WorkerResult */

/**
 * @param {InternalWorkerOptions} options
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

  const minifyFns = /** @type {[MinifyFunctions]} */ (
    typeof options.minify === "function" ? [options.minify] : options.minify
  );

  /**
   * @param {any} item
   * @returns {WorkerResult}
   */
  const normalizeProcessedResult = (item) => {
    if (!item.info) {
      item.info = {};
    }

    if (!item.errors) {
      item.errors = [];
    }

    if (!item.warnings) {
      item.warnings = [];
    }

    if (options.severityError === "off") {
      item.warnings = [];
      item.errors = [];
    } else if (options.severityError === "warning") {
      item.warnings = [...item.warnings, ...item.errors];
      item.errors = [];
    }

    if (
      typeof options.newFilename !== "undefined" &&
      typeof options.generateFilename !== "undefined"
    ) {
      item.filename = options.generateFilename(options.newFilename, {
        filename: item.filename,
      });
    }

    return item;
  };

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i]
      : options.minimizerOptions || {};

    /** @type {WorkerResult} */
    let processedResult;

    try {
      // eslint-disable-next-line no-await-in-loop
      processedResult = await minifyFn(result, minifyOptions);
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

    result = normalizeProcessedResult(processedResult);
  }

  return result;
}

module.exports = worker;
