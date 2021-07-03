import path from "path";

import minify from "./minify";
import schema from "./loader-options.json";
import imageminMinify from "./utils/imageminMinify";

/**
 * @typedef {Object} LoaderOptions
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {MinimizerOptions} [minimizerOptions] Options for `imagemin`.
 * @property {string} [filename] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {MinifyFunctions} [minify]
 */

/** @typedef {import("./index").Rules} Rules */
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
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
  const input = content;

  const { severityError, minimizerOptions } = options;

  const compilation = /** @type {Compilation} */ (this._compilation);
  const minifyOptions = /** @type {InternalMinifyOptions} */ ({
    minify: options.minify || imageminMinify,
    input,
    filename: name,
    severityError,
    minimizerOptions,
    isProductionMode: this.mode === "production" || !this.mode,
    generateFilename: compilation.getAssetPath.bind(compilation),
  });

  const [output] = await minify(minifyOptions);

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
  const { path: newName } = /** @type {Compilation} */ (
    this._compilation
  ).getPathWithInfo(options.filename || "[path][name][ext]", {
    filename: name,
  });

  const isNewAsset = name !== newName;

  if (isNewAsset) {
    this.emitFile(newName, source.toString(), "", {
      minimized: true,
    });

    callback(null, content);

    return;
  }

  callback(null, source);
};

module.exports.raw = true;
