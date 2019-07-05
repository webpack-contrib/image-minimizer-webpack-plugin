"use strict";

const os = require("os");
const crypto = require("crypto");
const imagemin = require("imagemin");
const cacache = require("cacache");
const serialize = require("serialize-javascript");
const findCacheDir = require("find-cache-dir");
const pLimit = require("p-limit");
const deepmerge = require("deepmerge");

function runImagemin(source, imageminOptions) {
  return Promise.resolve().then(() => imagemin.buffer(source, imageminOptions));
}

function prepareImageminOptions(options, result) {
  if (
    !options.imageminOptions ||
    !options.imageminOptions.plugins ||
    (options.imageminOptions.plugins &&
      options.imageminOptions.plugins.length === 0)
  ) {
    return options;
  }

  const imageminOptions = deepmerge({}, options.imageminOptions);

  if (!imageminOptions.pluginsMeta) {
    imageminOptions.pluginsMeta = [];
  }

  imageminOptions.plugins = imageminOptions.plugins
    .map(plugin => {
      const isPluginArray = Array.isArray(plugin);

      if (typeof plugin === "string" || isPluginArray) {
        const pluginName = isPluginArray ? plugin[0] : plugin;
        // eslint-disable-next-line no-undefined
        const pluginOptions = isPluginArray ? plugin[1] : undefined;

        let requiredPlugin = null;
        let requiredPluginName = `imagemin-${pluginName}`;

        try {
          // eslint-disable-next-line global-require, import/no-dynamic-require
          requiredPlugin = require(requiredPluginName)(pluginOptions);
        } catch (ignoreError) {
          requiredPluginName = pluginName;

          try {
            // eslint-disable-next-line global-require, import/no-dynamic-require
            requiredPlugin = require(requiredPluginName)(pluginOptions);
          } catch (ignoreError1) {
            const pluginNameForError = pluginName.startsWith("imagemin")
              ? pluginName
              : `imagemin-${pluginName}`;

            const error = new Error(
              `Unknown plugin: ${pluginNameForError}\n\nDid you forget to install the plugin?\nYou can install it with:\n\n$ npm install ${pluginNameForError} --save-dev\n$ yarn add ${pluginNameForError} --dev`
            );

            if (options.bail) {
              result.errors.push(error);
            } else {
              result.warnings.push(error);
            }

            return false;
          }
          // Nothing
        }

        let version = "unknown";

        try {
          // eslint-disable-next-line global-require, import/no-dynamic-require
          ({ version } = require(`${requiredPluginName}/package.json`));
        } catch (ignoreVersion) {
          // Nothing
        }

        imageminOptions.pluginsMeta.push([
          {
            name: requiredPluginName,
            options: pluginOptions || {},
            version
          }
        ]);

        return requiredPlugin;
      }

      result.warnings.push(
        new Error(
          "Do not use a function as plugin (i.e. `{ plugins: [imageminMozjpeg()] }`), it is not allowed invalidate a cache. It will be removed in next major release. You can rewrite this to `{ plugins: [['mozjpeg', options]] }`, please see the documentation for more information."
        )
      );

      return plugin;
    })
    .filter(Boolean);

  return imageminOptions;
}

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
        imageminVersion = "unknown";
        // Nothing
      }

      try {
        // eslint-disable-next-line global-require
        packageVersion = require("../package.json").version;
      } catch (ignoreError) {
        packageVersion = "unknown";
        // Nothing
      }
    }

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

          const imageminOptions = prepareImageminOptions(options, result);

          if (
            !imageminOptions ||
            !imageminOptions.plugins ||
            imageminOptions.plugins.length === 0
          ) {
            result.output = source;

            const error = new Error(
              "No plugins found for `imagemin`. Please read documentation."
            );

            if (options.bail) {
              result.errors.push(error);
            } else {
              result.warnings.push(error);
            }

            return result;
          }

          if (options.filter && !options.filter(source, path)) {
            result.filtered = true;
            result.output = source;

            return result;
          }

          let cacheKey = null;

          if (options.cache) {
            cacheKey = serialize({
              hash: crypto
                .createHash("md4")
                .update(input)
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
                return cacache
                  .get(cacheDir, cacheKey)
                  .then(
                    ({ data }) => data,
                    () =>
                      runImagemin(source, imageminOptions).then(
                        optimizedSource =>
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
  });
}

module.exports = minify;
