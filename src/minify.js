import { getConfigForFile, runImagemin } from './utils';

async function minify(options = {}) {
  const { source, input, filename, severityError, isProductionMode } = options;

  const result = {
    source,
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

  const minimizerOptions = getConfigForFile(options, result);

  try {
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

    result.compressed = input;

    return result;
  }

  result.compressed = output;

  return result;
}

module.exports = minify;
