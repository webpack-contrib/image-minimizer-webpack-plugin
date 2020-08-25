"use strict";

const path = require("path");

const loaderUtils = require("loader-utils");

const minify = require("./minify");

module.exports = async function loader(content) {
  const options = loaderUtils.getOptions(this);
  const callback = this.async();

  const bail =
    typeof options.bail === "undefined"
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
        imageminOptions: options.imageminOptions,
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
