/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").FilenameFn} FilenameFn */

const isFilenameProcessed = Symbol("isFilenameProcessed");

/**
 * @template T
 * @param {WorkerResult} result
 * @param {import("./index").InternalWorkerOptions<T>} options
 * @param {undefined | string | FilenameFn} filenameTemplate
 */
function processFilenameTemplate(result, options, filenameTemplate) {
  if (
    // @ts-ignore
    !result.info[isFilenameProcessed] &&
    typeof filenameTemplate !== "undefined" &&
    typeof options.generateFilename === "function"
  ) {
    result.filename = options.generateFilename(filenameTemplate, {
      filename: result.filename,
    });

    result.filename = result.filename
      .replace(/\[width\]/gi, result.info.width)
      .replace(/\[height\]/gi, result.info.height);

    // @ts-ignore
    result.info[isFilenameProcessed] = true;
  }
}

/**
 * @template T
 * @param {WorkerResult} result
 * @param {import("./index").InternalWorkerOptions<T>} options
 */
function processSeverityError(result, options) {
  if (options.severityError === "off") {
    result.warnings = [];
    result.errors = [];
  } else if (options.severityError === "warning") {
    result.warnings = [...result.warnings, ...result.errors];
    result.errors = [];
  }
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
    info: {
      sourceFilename:
        options.info &&
        typeof options.info === "object" &&
        typeof options.info.sourceFilename === "string"
          ? options.info.sourceFilename
          : typeof options.filename === "string"
            ? options.filename
            : undefined,
    },
  };

  if (!result.data) {
    result.errors.push(new Error("Empty input"));
    return result;
  }

  const transformers = Array.isArray(options.transformer)
    ? options.transformer
    : [options.transformer];

  /** @type {undefined | string | FilenameFn} */
  let filenameTemplate;

  for (const transformer of transformers) {
    if (
      typeof transformer.filter === "function" &&
      !transformer.filter(options.input, options.filename)
    ) {
      continue;
    }

    /** @type {WorkerResult | null} */
    let processedResult;

    try {
      // eslint-disable-next-line no-await-in-loop
      processedResult = await transformer.implementation(
        result,
        transformer.options,
      );
    } catch (error) {
      result.errors.push(
        error instanceof Error
          ? error
          : new Error(/** @type {string} */ (error)),
      );

      return result;
    }

    if (processedResult && !Buffer.isBuffer(processedResult.data)) {
      result.errors.push(
        new Error(
          "minimizer function doesn't return the 'data' property or result is not a 'Buffer' value",
        ),
      );

      return result;
    }

    if (processedResult) {
      result = processedResult;
      filenameTemplate ??= transformer.filename;
    }
  }

  result.info ??= {};
  result.errors ??= [];
  result.warnings ??= [];
  result.filename ??= options.filename;

  processSeverityError(result, options);
  processFilenameTemplate(result, options, filenameTemplate);

  return result;
}

module.exports = worker;
