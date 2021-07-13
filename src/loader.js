import path from "path";

import minify from "./minify";
import schema from "./loader-options.json";
import imageminMinify from "./utils/imageminMinify";

/** @typedef {import("./index").Rules} Rules */
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compilation} Compilation */

/**
 * @typedef {Object} LoaderOptions
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {MinimizerOptions} [minimizerOptions] Options for `imagemin`, `squoosh` or custom function.
 * @property {string} [filename] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {MinifyFunctions} [minify]
 */

/** @typedef {import("webpack").LoaderContext<LoaderOptions>} LoaderContext */
/** @typedef {import("webpack").RawLoaderDefinition<LoaderOptions>} RawLoaderDefinition */

/**
 * @type {RawLoaderDefinition}
 */
// eslint-disable-next-line func-style
const loader = async function loader(content) {
  const options = this.getOptions(/** @type {Schema} */ (schema));
  const name = path.relative(this.rootContext, this.resourcePath);
  const input = content;

  const { severityError, minimizerOptions } = options;

  const compilation = /** @type {Compilation} */ (this._compilation);
  const minifyOptions = /** @type {InternalMinifyOptions} */ ({
    filename: name,
    input,
    minify: options.minify || imageminMinify,
    minimizerOptions,
    severityError,
    generateFilename: compilation.getAssetPath.bind(compilation),
  });

  const [output] = await minify(minifyOptions);

  if (options.severityError !== "off") {
    if (output.errors && output.errors.length > 0) {
      output.errors.forEach((error) => {
        if (options.severityError === "warning") {
          this.emitWarning(error);
        } else {
          this.emitError(error);
        }
      });
    }

    if (output.warnings && output.warnings.length > 0) {
      output.warnings.forEach((warning) => {
        this.emitWarning(warning);
      });
    }
  }

  return output.data;
};

loader.raw = true;

module.exports = loader;
