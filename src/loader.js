import path from "path";

import worker from "./worker";
import schema from "./loader-options.json";
import { imageminMinify } from "./utils.js";

/**
 * @typedef {Object} LoaderOptions
 * @property {FilterFn} [filter] Allows filtering of images for optimization.
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {MinimizerOptions} [minimizerOptions] Options for `imagemin`.
 * @property {string} [filename] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {boolean} [deleteOriginalAssets] Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
 * @property {MinifyFunctions} [minify]
 */

/** @typedef {import("./index").FilterFn} FilterFn */
/** @typedef {import("./index").Rules} Rules */
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalWorkerOptions} InternalWorkerOptions */
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").LoaderContext<LoaderOptions>} LoaderContext */
/** @typedef {import("webpack").Compilation} Compilation */

/**
 * @this {LoaderContext}
 * @param {Buffer} content
 */
module.exports = async function loader(content) {
  // @ts-ignore
  const options = this.getOptions(/** @type {Schema} */ (schema));
  const callback = this.async();
  const name = path.relative(this.rootContext, this.resourcePath);

  if (options.filter && !options.filter(content, name)) {
    callback(null, content);

    return;
  }

  const input = content;

  const {
    minify,
    minimizerOptions,
    severityError,
    filename = "[path][name][ext]",
  } = options;

  const minifyOptions = /** @type {InternalWorkerOptions} */ ({
    input,
    filename: name,
    severityError,
    minify: minify || imageminMinify,
    minimizerOptions,
    newFilename: filename,
    generateFilename:
      /** @type {Compilation} */
      (this._compilation).getAssetPath.bind(this._compilation),
  });

  const output = await worker(minifyOptions);

  if (output.errors && output.errors.length > 0) {
    output.errors.forEach((warning) => {
      this.emitError(warning);
    });

    callback(null, content);

    return;
  }

  if (output.warnings && output.warnings.length > 0) {
    output.warnings.forEach((warning) => {
      this.emitWarning(warning);
    });
  }

  const source = output.data;

  const isNewAsset = name !== output.filename;

  if (isNewAsset) {
    this.emitFile(output.filename, source.toString(), "", {
      minimized: true,
    });

    if (options.deleteOriginalAssets) {
      // TODO remove original asset
    }

    callback(null, content);

    return;
  }

  callback(null, source);
};

module.exports.raw = true;
