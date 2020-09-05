import { getConfigForFile, runImagemin } from './utils';

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

  // Ensure that the contents i have are in the form of a buffer
  result.input = Buffer.isBuffer(input) ? input : Buffer.from(input);

  let output;
  let minimizerOptions;

  try {
    minimizerOptions = getConfigForFile(options, result);

    output = await runImagemin(result.input, minimizerOptions);
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
      compressed: input,
      warnings: result.warnings,
      errors: result.errors,
    };
  }

  return {
    filename,
    compressed: output,
    warnings: result.warnings,
    errors: result.errors,
  };
}

module.exports = minify;
