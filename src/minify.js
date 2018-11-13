"use strict";

const imagemin = require("imagemin");
const cacache = require("cacache");
const crypto = require("crypto");
const serialize = require("serialize-javascript");
const findCacheDir = require("find-cache-dir");

function runImagemin(source, imageminOptions) {
  const originalSize = source.length;

  return Promise.resolve().then(() =>
    imagemin.buffer(source, imageminOptions).then(optimizedSource => {
      if (optimizedSource.length < originalSize) {
        return optimizedSource;
      }

      return source;
    })
  );
}

function minify(task = {}) {
  const { bail, cache, imageminOptions, input } = task;
  const result = {
    errors: [],
    output: null,
    warnings: []
  };

  if (!input) {
    result.errors.push(new Error("Empty input"));

    return result;
  }

  if (
    !imageminOptions ||
    !imageminOptions.plugins ||
    imageminOptions.plugins.length === 0
  ) {
    result.errors.push(new Error("No plugins found for `imagemin`"));

    return result;
  }

  // Ensure that the contents i have are in the form of a buffer
  const source = Buffer.isBuffer(input) ? input : Buffer.from(input);

  // Need invalidate on all options in plugins and version plugins

  let cacheDir = null;
  let cacheKey = null;

  if (cache) {
    cacheDir =
      cache === true ? findCacheDir({ name: "imagemin-webpack" }) : cache;
    cacheKey = serialize({
      hash: crypto
        .createHash("md4")
        .update(input)
        .digest("hex"),
      // eslint-disable-next-line global-require
      imagemin: require("imagemin/package.json").version,
      "imagemin-options": imageminOptions,
      // eslint-disable-next-line global-require
      "imagemin-webpack": require("../package.json").version
    });
  }

  return Promise.resolve()
    .then(() => {
      // If `cache` enabled, we try to get compressed source from cache, if cache doesn't found, we run `imagemin`.
      if (cache) {
        return cacache
          .get(cacheDir, cacheKey)
          .then(
            ({ data }) => data,
            () =>
              runImagemin(source, imageminOptions).then(optimizedSource =>
                cacache
                  .put(cacheDir, cacheKey, optimizedSource)
                  .then(() => optimizedSource)
              )
          );
      }

      // If `cache` disable, we just run `imagemin`.
      return runImagemin(source, imageminOptions);
    })
    .then(optimizedSource => {
      result.output = optimizedSource;

      return result;
    })
    .catch(error => {
      if (bail) {
        result.errors.push(error);
      } else {
        result.warnings.push(error);
      }

      // Don't cache images with errors.
      // Return original source if something wrong.
      result.output = source;

      return result;
    });
}

module.exports = minify;
