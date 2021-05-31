async function minify(options = {}) {
  const minifyFns =
    typeof options.minify === "function" ? [options.minify] : options.minify;

  const result = {
    code: options.input,
    filename: options.filename,
    warnings: [],
    errors: [],
  };

  if (!result.code) {
    result.errors.push(new Error("Empty input"));

    return result;
  }

  try {
    for (let i = 0; i <= minifyFns.length - 1; i++) {
      const minifyFn = minifyFns[i];
      const minifyOptions = Array.isArray(options.minimizerOptions)
        ? options.minimizerOptions[i]
        : options.minimizerOptions;
      // eslint-disable-next-line no-await-in-loop
      const minifyResult = await minifyFn(
        { [options.filename]: result.code },
        minifyOptions
      );

      result.code = minifyResult.code;
      result.warnings = [...result.warnings, ...(minifyResult.warnings || [])];
      result.errors = [...result.errors, ...(minifyResult.errors || [])];
    }
  } catch (error) {
    const errored = error instanceof Error ? error : new Error(error);

    result.errors.push(errored);
    result.code = options.input;
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
        case false:
          break;
        case "error":
        case true:
          errors.push(error);
          break;
        case "warning":
          result.warnings.push(error);
          break;
        case "auto":
        default:
          if (options.isProductionMode) {
            errors.push(error);
          } else {
            result.warnings.push(error);
          }
      }
    }

    result.errors = errors;
  }

  return result;
}

module.exports = minify;
