"use strict";

const loaderUtils = require("loader-utils");
const nodeify = require("nodeify");

const minify = require("./minify");

module.exports = function(content) {
  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();
  /* eslint-disable no-underscore-dangle */
  let { bail } = options;

  if (typeof bail === "undefined") {
    bail =
      (this._compiler &&
        this._compiler.options &&
        this._compiler.options.bail) ||
      false;
  }

  return nodeify(
    Promise.resolve().then(() =>
      minify({
        bail,
        cache: options.cache,
        imageminOptions: options.imageminOptions,
        input: content
      })
    ),
    (error, result) => {
      if (error) {
        return callback(error);
      }

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

      const data = result.output ? result.output : content;

      // A trick to avoid double compression by our plugin.
      // Webpack doesn't have api to store meta information for assets,
      // maybe in future it will be implemented.
      data._compressed = true;

      return callback(null, data);
    }
  );
};

module.exports.raw = true;
