"use strict";

const loaderUtils = require("loader-utils");
const nodeify = require("nodeify");

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

  return nodeify(
    Promise.resolve().then(() =>
      minify([{ input: content, path: resourcePath }], {
        bail,
        cache: options.cache,
        imageminOptions: options.imageminOptions,
        filter: options.filter
      })
    ),
    (error, results) => {
      if (error) {
        return callback(error);
      }

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

      return callback(null, data);
    }
  );
};

module.exports.raw = true;
