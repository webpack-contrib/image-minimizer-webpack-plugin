import { getConfigForFile, runImagemin } from './utils';

async function minify(task, options = {}) {
  const { source, input, filename } = task;
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

  result.output = result.source;

  if (options.filter && !options.filter(result.input, filename)) {
    result.filtered = true;

    return result;
  }

  const minimizerOptions = getConfigForFile(options, result);

  let output;

  try {
    output = await runImagemin(result.input, minimizerOptions);
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

    return result;
  }

  result.output = output;

  return result;
}

module.exports = minify;
