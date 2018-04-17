"use strict";

const loaderUtils = require("loader-utils");
const nodeify = require("nodeify");
const findCacheDir = require("find-cache-dir");

const { cacheWrapper } = require("./utils");
const minify = require("./minify/minify");

module.exports = function(content) {
  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();
  /* eslint-disable no-underscore-dangle */
  const bail =
    (this._compiler && this._compiler.options && this._compiler.options.bail) ||
    false;

  if (typeof options.bail !== "boolean") {
    options.bail = bail;
  }

  const cacheDir =
    options.cache === true
      ? findCacheDir({ name: "imagemin-webpack" })
      : options.cache;

  const task = {
    bail: options.bail,
    file: this.resourcePath,
    imageminOptions: options.imageminOptions,
    input: content
  };

  return nodeify(
    Promise.resolve().then(
      () =>
        cacheDir ? cacheWrapper(minify(task), task, cacheDir) : minify(task)
    ),
    (error, result) => {
      if (error) {
        return callback(error);
      }

      if (result.warnings && result.warnings.size > 0) {
        result.warnings.forEach(warning => {
          this.emitWarning(warning);
        });
      }

      if (result.errors && result.errors.size > 0) {
        result.errors.forEach(warning => {
          this.emitError(warning);
        });
      }

      return callback(null, result.output ? result.output : content);
    }
  );
};

module.exports.raw = true;
