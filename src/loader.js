import path from 'path';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import minify from './minify';
import schema from './loader-options.json';

module.exports = async function loader(content) {
  const options = loaderUtils.getOptions(this);

  validateOptions(schema, options, {
    name: 'Image Minimizer Plugin Loader',
    baseDataPath: 'options',
  });

  const callback = this.async();

  const bail =
    typeof options.bail === 'undefined'
      ? // eslint-disable-next-line no-underscore-dangle
        (this._compiler &&
          // eslint-disable-next-line no-underscore-dangle
          this._compiler.options &&
          // eslint-disable-next-line no-underscore-dangle
          this._compiler.options.bail) ||
        false
      : options.bail;

  const { resourcePath } = this;

  let result;

  try {
    [result] = await minify(
      [
        {
          input: content,
          filename: path.relative(this.rootContext, resourcePath),
        },
      ],
      {
        bail,
        cache: options.cache,
        minimizerOptions: options.minimizerOptions,
        filter: options.filter,
      }
    );
  } catch (error) {
    callback(error);

    return;
  }

  if (result.warnings && result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      this.emitWarning(warning);
    });
  }

  if (result.errors && result.errors.length > 0) {
    result.errors.forEach((warning) => {
      this.emitError(warning);
    });
  }

  const data = result.output ? result.output : result.input;

  callback(null, data);
};

module.exports.raw = true;
