"use strict";

const loaderUtils = require("loader-utils");
const nodeify = require("nodeify");
const minify = require("./minify/minify");

module.exports = function(content) {
  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();

  if (typeof options.bail === "undefined") {
    /* eslint-disable no-underscore-dangle */
    options.bail =
      (this._compiler &&
        this._compiler.options &&
        this._compiler.options.bail) ||
      false;
    /* eslint-enable no-underscore-dangle */
  }

  return nodeify(minify(content, options), callback);
};

module.exports.raw = true;
