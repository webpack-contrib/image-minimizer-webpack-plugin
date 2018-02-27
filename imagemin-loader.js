"use strict";

const loaderUtils = require("loader-utils");
const imagemin = require("imagemin");
const nodeify = require("nodeify");

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = function(content) {
  const options = loaderUtils.getOptions(this) || {};
  const bail =
    options.bail ||
    /* eslint-disable-next-line no-underscore-dangle */
    (this._compiler && this._compiler.options && this._compiler.options.bail) ||
    false;
  const plugins = options.plugins || [];
  const callback = this.async();

  if (plugins.length === 0) {
    return callback(new Error("No plugins found for `imagemin-loader`"));
  }

  return nodeify(
    imagemin.buffer(content, { plugins }),
    (error, optimizedContent) => {
      const handledContent = error ? content : optimizedContent;

      return callback(bail ? error : null, handledContent);
    }
  );
};

module.exports.raw = true;
