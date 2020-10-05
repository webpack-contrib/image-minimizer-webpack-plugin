import imagemin from 'imagemin';

import normalizeConfig from './utils/normalize-config';

async function minify(options = {}) {
  const { input, filename, severityError, isProductionMode } = options;

  const result = {
    input,
    filename,
    warnings: [],
    errors: [],
  };

  if (!result.input) {
    result.errors.push(new Error('Empty input'));

    return result;
  }

  result.input = input;

  let output;
  let minimizerOptions;

  try {
    // Implement autosearch config on root directory of project in future
    minimizerOptions = normalizeConfig(options.minimizerOptions, {
      options,
      result,
    });

    output = await imagemin.buffer(result.input, minimizerOptions);
  } catch (error) {
    const errored = error instanceof Error ? error : new Error(error);

    switch (severityError) {
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
        if (isProductionMode) {
          result.errors.push(errored);
        } else {
          result.warnings.push(errored);
        }
    }

    return {
      filename,
      output: input,
      warnings: result.warnings,
      errors: result.errors,
    };
  }

  return {
    filename,
    output,
    warnings: result.warnings,
    errors: result.errors,
  };
}

module.exports = minify;
