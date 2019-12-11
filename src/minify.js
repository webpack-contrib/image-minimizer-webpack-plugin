"use strict";

const path = require("path");
const os = require("os");
const crypto = require("crypto");
const cacache = require("cacache");
const serialize = require("serialize-javascript");
const findCacheDir = require("find-cache-dir");
const pLimit = require("p-limit");
const getConfigForFile = require("./utils/get-config-for-file");
const runImagemin = require("./utils/run-imagemin");

function minify(tasks = [], options = {}) {
  return Promise.resolve().then(() => {
    if (tasks.length === 0) {
      return [];
    }

    const cpus = os.cpus() || { length: 1 };
    const limit = pLimit(
      options.maxConcurrency || Math.max(1, cpus.length - 1)
    );

    let cacheDir = null;
    let imageminVersion = null;
    let packageVersion = null;

    if (options.cache) {
      cacheDir =
        options.cache === true
          ? findCacheDir({ name: "imagemin-webpack" }) || os.tmpdir()
          : options.cache;

      try {
        // eslint-disable-next-line global-require
        imageminVersion = require("imagemin/package.json").version;
      } catch (ignoreError) {
        /* istanbul ignore next */
        imageminVersion = "unknown";
        // Nothing
      }

      try {
        // eslint-disable-next-line global-require
        packageVersion = require("../package.json").version;
      } catch (ignoreError) {
        /* istanbul ignore next */
        packageVersion = "unknown";
        // Nothing
      }
    }

    return Promise.all(
      tasks.map(task =>
        limit(() => {
          const { input, filePath } = task;
          const result = {
            input,
            // Return original source if something wrong
            output: input,
            warnings: [],
            errors: []
          };

          if (filePath) {
            result.filePath = path.isAbsolute(filePath)
              ? filePath
              : path.resolve(filePath);
          }

          if (!result.input) {
            result.errors.push(new Error("Empty input"));

            return result;
          }

          // Ensure that the contents i have are in the form of a buffer
          result.input = Buffer.isBuffer(input) ? input : Buffer.from(input);

          return Promise.resolve()
            .then(() => {
              if (options.filter && !options.filter(result.input, filePath)) {
                result.filtered = true;

                return result;
              }

              return Promise.resolve()
                .then(() => getConfigForFile(result.filePath, options, result))
                .then(imageminOptions => {
                  let cacheKey = null;

                  if (options.cache) {
                    cacheKey = serialize({
                      hash: crypto
                        .createHash("md4")
                        .update(result.input)
                        .digest("hex"),
                      imagemin: imageminVersion,
                      "imagemin-options": imageminOptions,
                      "imagemin-webpack": packageVersion
                    });
                  }

                  return Promise.resolve()
                    .then(() => {
                      // If `cache` enabled, we try to get compressed source from cache, if cache doesn't found, we run `imagemin`.
                      if (options.cache) {
                        return cacache.get(cacheDir, cacheKey).then(
                          ({ data }) => data,
                          () =>
                            runImagemin(
                              result.input,
                              imageminOptions
                            ).then(optimizedSource =>
                              cacache
                                .put(cacheDir, cacheKey, optimizedSource)
                                .then(() => optimizedSource)
                            )
                        );
                      }

                      // If `cache` disable, we just run `imagemin`.
                      return runImagemin(result.input, imageminOptions);
                    })
                    .then(optimizedSource => {
                      result.output = optimizedSource;

                      return result;
                    });
                });
            })
            .catch(error => {
              if (options.bail) {
                result.errors.push(error);
              } else {
                result.warnings.push(error);
              }

              return result;
            });
        })
      )
    );
  });
}

module.exports = minify;
