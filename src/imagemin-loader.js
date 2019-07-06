"use strict";

const loaderUtils = require("loader-utils");

const minify = require("./minify");

module.exports = function(content) {
  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();
  let { bail } = options;

  if (typeof bail === "undefined") {
    /* eslint-disable no-underscore-dangle */
    bail =
      (this._compiler &&
        this._compiler.options &&
        this._compiler.options.bail) ||
      false;
    /* eslint-enable no-underscore-dangle */
  }

  const { resourcePath } = this;

  Promise.resolve()
    .then(() =>
      minify([{ input: content, filePath: resourcePath }], {
        bail,
        cache: options.cache,
        imageminOptions: options.imageminOptions,
        filter: options.filter
      })
    )
    .then(results => {
      const [result] = results;

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          this.emitWarning(warning);
        });
      }

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(warning => {
          this.emitError(warning);
        });
      }

      const data = result.output ? result.output : result.input;

      // eslint-disable-next-line promise/no-callback-in-promise
      return callback(null, data);
    })
    // eslint-disable-next-line promise/no-callback-in-promise
    .catch(error => callback(error));
};

module.exports.raw = true;
