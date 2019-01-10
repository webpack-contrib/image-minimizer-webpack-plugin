"use strict";

const os = require("os");
const crypto = require("crypto");
const imagemin = require("imagemin");
const cacache = require("cacache");
const serialize = require("serialize-javascript");
const findCacheDir = require("find-cache-dir");
const pLimit = require("p-limit");

function runImagemin(source, imageminOptions) {
  return Promise.resolve().then(() => imagemin.buffer(source, imageminOptions));
}

function minify(tasks = [], options = {}) {
  if (tasks.length === 0) {
    return Promise.resolve([]);
  }

  const cpus = os.cpus() || { length: 1 };
  const limit = pLimit(options.maxConcurrency || Math.max(1, cpus.length - 1));

  return Promise.all(
    tasks.map(task =>
      limit(() => {
        const { input, path } = task;
        const result = {
          input,
          path,
          warnings: [],
          errors: []
        };

        if (!input) {
          result.errors.push(new Error("Empty input"));

          return result;
        }

        // Ensure that the contents i have are in the form of a buffer
        const source = Buffer.isBuffer(input) ? input : Buffer.from(input);

        if (
          !options.imageminOptions ||
          !options.imageminOptions.plugins ||
          options.imageminOptions.plugins.length === 0
        ) {
          result.output = source;
          result.errors.push(new Error("No plugins found for `imagemin`"));

          return result;
        }

        if (options.filter && !options.filter(source, path)) {
          result.filtered = true;
          result.output = source;

          return Promise.resolve(result);
        }

        // Need invalidate on all options in plugins and version plugins

        let cacheDir = null;
        let cacheKey = null;

        if (options.cache) {
          cacheDir =
            options.cache === true
              ? findCacheDir({ name: "imagemin-webpack" })
              : options.cache;
          cacheKey = serialize({
            hash: crypto
              .createHash("md4")
              .update(input)
              .digest("hex"),
            // eslint-disable-next-line global-require
            imagemin: require("imagemin/package.json").version,
            "imagemin-options": options.imageminOptions,
            // eslint-disable-next-line global-require
            "imagemin-webpack": require("../package.json").version
          });
        }

        return Promise.resolve()
          .then(() => {
            // If `cache` enabled, we try to get compressed source from cache, if cache doesn't found, we run `imagemin`.
            if (options.cache) {
              return cacache
                .get(cacheDir, cacheKey)
                .then(
                  ({ data }) => data,
                  () =>
                    runImagemin(source, options.imageminOptions).then(
                      optimizedSource =>
                        cacache
                          .put(cacheDir, cacheKey, optimizedSource)
                          .then(() => optimizedSource)
                    )
                );
            }

            // If `cache` disable, we just run `imagemin`.
            return runImagemin(source, options.imageminOptions);
          })
          .then(optimizedSource => {
            result.output = optimizedSource;

            return result;
          })
          .catch(error => {
            if (options.bail) {
              result.errors.push(error);
            } else {
              result.warnings.push(error);
            }

            // Don't cache images with errors.
            // Return original source if something wrong.
            result.output = source;

            return result;
          });
      })
    )
  );
}

module.exports = minify;
