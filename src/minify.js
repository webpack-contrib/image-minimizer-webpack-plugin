/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */

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

  const results = [input];

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i] || {}
      : options.minimizerOptions || {};

    /** @type {MinifyFnResult | MinifyFnResult[] | undefined} */
    let processedResult;

    // TODO maybe promise?
    for (let k = 0; k <= results.length - 1; k++) {
      const original = results[k];

      if (minifyOptions.filter && !minifyOptions.filter(original)) {
        continue;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        processedResult = await minifyFn(
          { [original.filename]: original.data },
          minifyOptions
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

      if (!Array.isArray(processedResult)) {
        results.splice(k, 1, processedResult);
      }
    }

    if (Array.isArray(processedResult)) {
      results.push(...processedResult);
    }
  }
  
  console.log(results)

  return results;
}

module.exports = minify;
