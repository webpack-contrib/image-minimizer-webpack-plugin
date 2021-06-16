import path from "path";

import minify from "./minify";
import schema from "./loader-options.json";
import imageminMinify from "./utils/imageminMinify";

/**
 * @typedef {Object} LoaderOptions
 * @property {FilterFn} [filter] Allows filtering of images for optimization.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {MinimizerOptions} [minimizerOptions] Options for `imagemin`.
 * @property {MinifyFunctions} [minify]
 */

/** @typedef {import("./index").FilterFn} FilterFn */
/** @typedef {import("./index").Rules} Rules */
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").InternalMinifyResultEntry} InternalMinifyResultEntry */
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").LoaderContext<LoaderOptions>} LoaderContext */
/** @typedef {import("webpack").Compilation} Compilation */

/**
 * @this {LoaderContext}
 * @param {Buffer} content
 */
module.exports = async function loader(content) {
  const options = this.getOptions(/** @type {Schema} */ (schema));
  const callback = this.async();
  const name = path.relative(this.rootContext, this.resourcePath);

  const minimizerOptionsForFirstMinifyFn = Array.isArray(
    options.minimizerOptions
  )
    ? options.minimizerOptions[0]
    : options.minimizerOptions || {};

  if (
    minimizerOptionsForFirstMinifyFn.filter &&
    !minimizerOptionsForFirstMinifyFn.filter(content, name)
  ) {
    callback(null, content);

    return;
  }

  const input = content;

  const { severityError, minimizerOptions } = options;

  const minifyOptions = /** @type {InternalMinifyOptions} */ ({
    minify: options.minify || imageminMinify,
    input,
    filename: name,
    severityError,
    minimizerOptions,
    isProductionMode: this.mode === "production" || !this.mode,
  });

  let output = await minify(minifyOptions);
  let hasError = false;

  output = output.filter((file) => !file.remove);

  for (let i = 0; i <= output.length - 1; i++) {
    const file = output[i];

    if (file.errors.length > 0) {
      file.errors.forEach((error) => {
        this.emitError(error);
      });

      hasError = true;
    }
  }

  if (hasError) {
    callback(null, content);

    return;
  }

  for (let i = 0; i <= output.length - 1; i++) {
    const file = output[i];

    if (file.warnings && file.warnings.length > 0) {
      file.warnings.forEach((warning) => {
        this.emitWarning(warning);
      });
    }

    // @ts-ignore
    file.source = file.data;

    const { path: newName } = /** @type {Compilation} */ (
      this._compilation
    ).getPathWithInfo(file.filenameTemplate, {
      filename: file.filename,
    });

    const isNewAsset = name !== newName;

    if (isNewAsset) {
      // @ts-ignore
      this.emitFile(newName, file.source.toString(), "", {
        minimized: true,
      });

      if (file.remove) {
        // TODO remove original asset
      }

      callback(null, content);

      return;
    }
  }

  // Todo add export for multiple assets
  // @ts-ignore
  callback(null, output.length === 1 ? output[0].source : content);
};

module.exports.raw = true;
