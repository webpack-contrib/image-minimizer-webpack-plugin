"use strict";

const imagemin = require("imagemin");

function minify(task = {}) {
  const { imageminOptions, bail, input } = task;
  const result = {
    errors: new Set(),
    output: null,
    warnings: new Set()
  };

  if (!input) {
    result.errors.add(new Error("Empty input"));

    return result;
  }

  // Ensure that the contents i have are in the form of a buffer
  const source = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const originalSize = source.length;

  if (
    !imageminOptions ||
    !imageminOptions.plugins ||
    imageminOptions.plugins.length === 0
  ) {
    result.errors.add(new Error("No plugins found for `imagemin`"));

    return result;
  }

  // Await for imagemin to do the compression
  return Promise.resolve().then(() =>
    imagemin
      .buffer(source, imageminOptions)
      .then(optimizedSource => {
        if (optimizedSource.length < originalSize) {
          result.output = optimizedSource;
        } else {
          result.output = source;
        }

        return result;
      })
      .catch(error => {
        if (bail) {
          result.errors.add(error);
        } else {
          result.warnings.add(error);
        }

        return result;
      })
  );
}

module.exports = minify;
