"use strict";

const imagemin = require("imagemin");

function runImagemin(source, imageminOptions) {
  return imagemin.buffer(source, imageminOptions);
}

module.exports = runImagemin;
