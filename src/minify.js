/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyResult} InternalMinifyResult */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */

/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<InternalMinifyResult>}
 */
async function minify(options) {
  /** @type {MinifyFnResult} */
  const result = {
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

  try {
    for (let i = 0; i <= minifyFns.length - 1; i++) {
      const minifyFn = minifyFns[i];
      const minifyOptions = Array.isArray(options.minimizerOptions)
        ? options.minimizerOptions[i]
        : options.minimizerOptions;

      // eslint-disable-next-line no-await-in-loop
      const minifyResult = await minifyFn(result, minifyOptions);

      result.data = minifyResult.data;
    }
  } catch (error) {
    const errored =
      error instanceof Error ? error : new Error(/** @type {string} */ (error));

    result.errors.push(errored);
    result.data = options.input;
  }

  if (result.errors.length > 0) {
    const errors = [];

    for (const error of result.errors) {
      if (error.name === "ConfigurationError") {
        errors.push(error);

        continue;
      }

      switch (options.severityError) {
        case "off":
          break;
        case "warning":
          result.warnings.push(error);
          break;
        case "error":
        default:
          errors.push(error);
      }
    }

    result.errors = errors;
  }

  return result;
}

module.exports = minify;
