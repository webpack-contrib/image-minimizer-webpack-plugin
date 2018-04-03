"use strict";

const imagemin = require("imagemin");

function minify(input, options) {
  const { imageminOptions, bail } = options;
  // Ensure that the contents i have are in the form of a buffer
  const source = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const originalSize = source.length;

  if (imageminOptions.plugins.length === 0) {
    throw new Error("No plugins found for `imagemin`");
  }

  // Await for imagemin to do the compression
  return Promise.resolve().then(() =>
    imagemin
      .buffer(source, imageminOptions)
      .then(optimizedSource => {
        if (optimizedSource.length < originalSize) {
          return optimizedSource;
        }

        return input;
      })
      .catch(error => {
        if (bail) {
          throw error;
        }

        return Promise.resolve(source);
      })
  );
}

module.exports = minify;
