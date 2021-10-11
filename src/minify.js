/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyResult} MinifyResult */

/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<MinifyResult>}
 */
async function minify(options) {
  /** @type {MinifyResult} */
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

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i]
      : options.minimizerOptions;

    /** @type {MinifyResult} */
    let minifyResult;

    try {
      // eslint-disable-next-line no-await-in-loop
      minifyResult = await minifyFn(result, minifyOptions);
    } catch (error) {
      result.errors.push(
        error instanceof Error
          ? error
          : new Error(/** @type {string} */ (error))
      );

      return result;
    }

    if (!minifyResult || !Buffer.isBuffer(minifyResult.data)) {
      result.errors.push(
        new Error(
          "minimizer function doesn't return the 'data' property or result is not a 'Buffer' value"
        )
      );

      return result;
    }

    result.data = minifyResult.data;
    result.warnings = minifyResult.warnings || [];
    result.errors = minifyResult.errors || [];
    result.info = minifyResult.info || {};
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
