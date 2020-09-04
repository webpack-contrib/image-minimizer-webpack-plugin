import webpack from 'webpack';

import { getConfigForFile, runImagemin } from './utils';

const { RawSource } =
  // eslint-disable-next-line global-require
  webpack.sources || require('webpack-sources');

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

  if (options.loader) {
    result.output = input;
    result.source = result.source || input;
  } else {
    result.output = new RawSource(input);
    result.source = result.source || new RawSource(input);
  }

  if (options.filter && !options.filter(result.input, filename)) {
    result.filtered = true;

    return result;
  }

  const minimizerOptions = getConfigForFile(options, result);

  let output;

  try {
    // eslint-disable-next-line no-param-reassign
    output = options.loader
      ? await runImagemin(result.input, minimizerOptions)
      : new RawSource(await runImagemin(result.input, minimizerOptions));
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
