/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */
/** @typedef {import("./index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("./index").SquooshMinimizerOptions} SquooshMinimizerOptions */
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
    data: options.input,
    filename: options.filename,
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
    /** @type {MinimizerOptions} */
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i] || {}
      : options.minimizerOptions || {};

    /** @type {MinifyFnResult | MinifyFnResult[] | undefined} */
    let processedResult;
    const length = results.length - 1;

    // TODO maybe promise?
    for (let k = 0; k <= length; k++) {
      const original = results[k];

      if (minifyOptions.filter && !minifyOptions.filter(original)) {
        continue;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        processedResult = await minifyFn(
          { [original.filename]: original.data },
          /** @type {ImageminMinimizerOptions | SquooshMinimizerOptions | CustomFnMinimizerOptions} */ (
            minifyOptions
          )
        );
      } catch (error) {
        processedResult = original;

        const errored = error instanceof Error ? error : new Error(error);

        if (errored.name === "ConfigurationError") {
          processedResult.errors.push(errored);
        } else {
          switch (options.severityError) {
            case "off":
              break;
            case "warning":
              processedResult.warnings.push(errored);
              break;
            case "error":
            default:
              processedResult.errors.push(errored);
          }
        }
      }

      if (Array.isArray(processedResult)) {
        if (
          typeof minifyOptions.deleteOriginal !== "undefined" &&
          minifyOptions.deleteOriginal
        ) {
          results.splice(k, processedResult.length, ...processedResult);
        } else {
          results.push(...processedResult);
        }
      } else if (!Array.isArray(processedResult)) {
        if (
          typeof minifyOptions.deleteOriginal !== "undefined" &&
          !minifyOptions.deleteOriginal
        ) {
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
