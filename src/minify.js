/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyResultEntry} InternalMinifyResultEntry */
/** @typedef {import("./index").InternalMinifyResult} InternalMinifyResult */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResultEntry} MinifyFnResultEntry */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */

/**
 * @param {InternalMinifyOptions} options
 * @returns {Promise<InternalMinifyResult>}
 */
async function minify(options) {
  const FILENAME_TEMPLATE = "[path][name][ext]";
  const minifyFns = /** @type {[MinifyFunctions]} */ (
    typeof options.minify === "function" ? [options.minify] : options.minify
  );

  /** @type {InternalMinifyResultEntry} */
  const input = {
    data: options.input,
    filename: options.filename,
    filenameTemplate: FILENAME_TEMPLATE,
    warnings: [],
    errors: [],
  };

  if (!input.data) {
    input.errors.push(new Error("Empty input"));

    return [input];
  }

  /**
   * @typedef {Object} processResultEntry
   * @property {InternalMinifyResultEntry['filename']} minifyFnIndex
   * @property {InternalMinifyResultEntry} file
   */

  /**
   * @typedef {processResultEntry[]} processResult
   */
  const processResult = {
    [input.filename]: input,
  };

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i]
      : options.minimizerOptions || {};
    const {
      deleteOriginalAssets,
      filename: filenameTemplate = FILENAME_TEMPLATE,
    } = minifyOptions;

    for (const [key, file] of Object.entries(processResult)) {
      let minifyResult;

      if (
        // In the plugin and loader for the input asset, the filter has already been run
        i > 0 &&
        minifyOptions.filter &&
        !minifyOptions.filter(file.data, file.filename)
      ) {
        continue;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        minifyResult = await minifyFn(
          { [file.filename]: file.data },
          minifyOptions
        );
      } catch (error) {
        const errored = error instanceof Error ? error : new Error(error);

        file.errors.push(errored);

        minifyResult = file;
      }

      minifyResult = Array.isArray(minifyResult)
        ? minifyResult
        : [
            {
              filename: minifyResult.filename || file.filename,
              data: minifyResult.data,
              warnings: [...file.warnings, ...(minifyResult.warnings || [])],
              errors: [...file.errors, ...(minifyResult.errors || [])],
              type: minifyResult.type,
            },
          ];

      minifyResult.forEach((item) => {
        if (item.type === "generated") {
          const { path: newName } = options.getPathWithInfoFn(
            filenameTemplate,
            {
              filename: item.filename,
            }
          );

          item.filename = newName;

          processResult[item.filename] =
            /** @type InternalMinifyResultEntry */ (item);

          if (deleteOriginalAssets) {
            processResult[key].type = "removed";
          }

          return;
        }

        processResult[item.filename] = /** @type InternalMinifyResultEntry */ (
          item
        );
      });
    }
  }

  const result = [];

  for (const file of Object.values(processResult)) {
    result.push(file);

    if (file.errors.length > 0) {
      const errors = [];

      for (const error of file.errors) {
        if (error.name === "ConfigurationError") {
          errors.push(error);

          continue;
        }

        switch (options.severityError) {
          case "off":
            break;
          case "warning":
            file.warnings.push(error);
            break;
          case "error":
          default:
            errors.push(error);
        }
      }

      file.errors = errors;
    }
  }

  return result;
}

module.exports = minify;
