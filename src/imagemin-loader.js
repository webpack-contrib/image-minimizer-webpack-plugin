"use strict";

const loaderUtils = require("loader-utils");
const nodeify = require("nodeify");
const minify = require("./minify/minify");

module.exports = function(content) {
  const options = loaderUtils.getOptions(this) || {};
  const bail =
    options.bail ||
    /* eslint-disable-next-line no-underscore-dangle */
    (this._compiler && this._compiler.options && this._compiler.options.bail) ||
    false;
  const plugins = options.plugins || [];
  const callback = this.async();

  return nodeify(
    minify(content, { bail, imageminOptions: { plugins } }),
    callback
  );
};

module.exports.raw = true;
