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
async function minify(options) {
  const minifyFns = /** @type {[MinifyFunctions]} */ (
    typeof options.minify === "function" ? [options.minify] : options.minify
  );

  /** @type {MinifyFnResult} */
  const input = {
    filename: options.filename,
    data: options.input,
    info: options.info,
    warnings: [],
    errors: [],
  };

  if (!input.data) {
    input.errors.push(new Error("Empty input"));

    return [input];
  }

  /** @type {MinifyFnResult[]} */
  const results = [input];

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    /** @type {MinifyFunctions} */
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i] || {}
      : options.minimizerOptions || {};

    const { filter, deleteOriginal, filename } =
      /** @type {MinimizerOptions} */ (minifyOptions);

    /**
     * @param {any} item
     * @return {MinifyFnResult}
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

      if (!item.info.sourceFilename) {
        item.info.sourceFilename = item.filename;
      }

      if (options.severityError === "off") {
        item.warnings = [];
        item.errors = [];
      } else if (options.severityError === "warning") {
        item.warnings = [...item.warnings, ...item.errors];
        item.errors = [];
      }

      // TODO should we regenerate filename? I think no
      if (filename) {
        item.filename = options.generateFilename(filename, {
          filename: item.filename,
        });
      }

      return item;
    };

    /** @type {MinifyFnResult | MinifyFnResult[] | undefined} */
    let processedResult;
    const length = results.length - 1;

    // TODO maybe promise?
    for (let k = 0; k <= length; k++) {
      const original = results[k];

      if (filter && !filter(original)) {
        continue;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        processedResult = await minifyFn(original, minifyOptions);
      } catch (error) {
        processedResult = original;

        const errored = error instanceof Error ? error : new Error(error);

        processedResult.errors.push(errored);
      }

      if (Array.isArray(processedResult)) {
        processedResult = processedResult.map((item) =>
          normalizeProcessedResult(item)
        );

        if (typeof deleteOriginal !== "undefined" && deleteOriginal) {
          results.splice(k, processedResult.length, ...processedResult);
        } else {
          results.push(...processedResult);
        }
      } else if (!Array.isArray(processedResult)) {
        processedResult = normalizeProcessedResult(processedResult);

        if (typeof deleteOriginal !== "undefined" && !deleteOriginal) {
          results.push(processedResult);
        } else {
          results.splice(k, 1, processedResult);
        }
      }
    }
  }

  return results;
}

module.exports = minify;
