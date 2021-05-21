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
  const errors = [];

  try {
    // Implement autosearch config on root directory of project in future
    minimizerOptions = normalizeConfig(options.minimizerOptions, {
      options,
      result,
    });

    output = await imagemin.buffer(result.input, minimizerOptions);
  } catch (error) {
    const errored = error instanceof Error ? error : new Error(error);

    errors.push(errored);
    output = input;
  }

  for (const error of [...result.errors, ...errors]) {
    result.errors = [];

    switch (severityError) {
      case 'off':
      case false:
        break;
      case 'error':
      case true:
        result.errors.push(error);
        break;
      case 'warning':
        result.warnings.push(error);
        break;
      case 'auto':
      default:
        if (isProductionMode) {
          result.errors.push(error);
        } else {
          result.warnings.push(error);
        }
    }
  }

  return {
    filename,
    output,
    warnings: result.warnings,
    errors: result.errors,
  };
}

module.exports = minify;
