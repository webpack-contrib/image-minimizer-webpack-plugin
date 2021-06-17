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
  let processResult = [input];
  let transformedResults = [];
  let inputIndex = 0;

  for (let i = 0; i <= minifyFns.length - 1; i++) {
    const minifyFn = minifyFns[i];
    const minifyOptions = Array.isArray(options.minimizerOptions)
      ? options.minimizerOptions[i]
      : options.minimizerOptions || {};
    const {
      deleteOriginalAssets,
      filename: filenameTemplate = FILENAME_TEMPLATE,
    } = minifyOptions;

    transformedResults = [];
    console.log(processResult, inputIndex)
    for (let k = inputIndex; k <= processResult.length - 1; k++) {
      const inputAsset = processResult[inputIndex];
      const file = processResult[k];
      let minifyResult;

      if (
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
        const isSameAsset = inputAsset.filename === item.filename;

        if (isSameAsset) {
          if (item.data.equals(inputAsset.data)) {
            item.type = "removed";
          }

          if (item.type === "minimized") {
            processResult.splice(0, 1, /** @type InternalMinifyResultEntry */ (item))
          }
        }

        if (item.type === "generated") {
          const { path: newName } = options.getPathWithInfoFn(
            filenameTemplate,
            {
              filename: item.filename,
            }
          );

          item.filename = newName;

          transformedResults.push(/** @type InternalMinifyResultEntry */ (item));

          if (deleteOriginalAssets) {
            inputAsset.type = "removed";
          }
        }
      });
    }

    inputIndex += transformedResults.length;

    processResult = [...processResult, ...transformedResults];
  }

  const result = [];

  for (const file of processResult) {
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
