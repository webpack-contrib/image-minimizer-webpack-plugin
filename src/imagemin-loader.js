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
      minify({
        bail,
        cache: options.cache,
        filter: options.filter,
        imageminOptions: options.imageminOptions,
        input: content,
        sourcePath: resourcePath
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
      // eslint-disable-next-line no-underscore-dangle
      data._compressed = true;

      return callback(null, data);
    }
  );
};

module.exports.raw = true;
