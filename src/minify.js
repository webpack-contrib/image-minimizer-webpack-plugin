async function minify(options = {}) {
  const minifyFns =
    typeof options.minify === 'function' ? [options.minify] : options.minify;

  const result = {
    code: options.input,
    filename: options.filename,
    warnings: [],
    errors: [],
  };

  if (!result.code) {
    result.errors.push(new Error('Empty input'));

    return result;
  }

  try {
    for (let i = 0; i <= minifyFns.length - 1; i++) {
      const minifyFn = minifyFns[i];
      const minifyOptions = Array.isArray(options.minimizerOptions)
        ? options.minimizerOptions[i]
        : options.minimizerOptions;
      // eslint-disable-next-line no-await-in-loop
      result.code = await minifyFn(result.code, minifyOptions, { result });
    }
  } catch (error) {
    const errored = error instanceof Error ? error : new Error(error);

    switch (options.severityError) {
      case 'off':
      case false:
        break;
      case 'error':
      case true:
        result.errors.push(errored);
        break;
      case 'warning':
        result.warnings.push(errored);
        break;
      case 'auto':
      default:
        if (options.isProductionMode) {
          result.errors.push(errored);
        } else {
          result.warnings.push(errored);
        }
    }
    result.code = options.input;
  }

  return {
    filename: result.filename,
    output: result.code,
    warnings: result.warnings,
    errors: result.errors,
  };
}

module.exports = minify;
