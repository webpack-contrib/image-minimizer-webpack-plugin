"use strict";

const loaderUtils = require("loader-utils");
const nodeify = require("nodeify");
const minify = require("./minify/minify");

module.exports = function(content) {
  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();
  /* eslint-disable no-underscore-dangle */
  const bail =
    (this._compiler && this._compiler.options && this._compiler.options.bail) ||
    false;

  if (typeof options.bail !== "boolean" && bail) {
    options.bail = bail;
  }

  return nodeify(minify(content, options), callback);
};

module.exports.raw = true;
