import path from "path";

import minify from "./minify";
import schema from "./loader-options.json";
import imageminMinify from "./utils/imageminMinify";

/** @typedef {import("./index").Rules} Rules */
/** @typedef {import("./index").MinimizerOptions} MinimizerOptions */
/** @typedef {import("./index").MinifyFunctions} MinifyFunctions */
/** @typedef {import("./index").InternalMinifyOptions} InternalMinifyOptions */
/** @typedef {import("./index").MinifyFnResult} MinifyFnResult */
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
  const parsedQuery = new URLSearchParams(this.resourceQuery);
  const compilation = /** @type {Compilation} */ (this._compilation);
  const minifyOptions = /** @type {InternalMinifyOptions} */ ({
    filename: name,
    input: content,
    minify: options.minify || imageminMinify,
    minimizerOptions: options.minimizerOptions,
    generateFilename: compilation.getAssetPath.bind(compilation),
  });
  const preset = parsedQuery.get("preset");
  const output = await minify(minifyOptions);

  /**
   * @type {MinifyFnResult}
   */
  const item = preset
    ? output.find((item) => item.filename.endsWith(preset))
    : output[0];

  if (options.severityError !== "off") {
    if (item.errors && item.errors.length > 0) {
      item.errors.forEach((error) => {
        if (options.severityError === "warning") {
          this.emitWarning(error);
        } else {
          this.emitError(error);
        }
      });
    }

    if (item.warnings && item.warnings.length > 0) {
      item.warnings.forEach((warning) => {
        this.emitWarning(warning);
      });
    }
  }

  parsedQuery.delete("preset");

  const stringifiedParsedQuery = parsedQuery.toString();
  const query =
    stringifiedParsedQuery.length > 0 ? `?${stringifiedParsedQuery}` : "";

  // For `file-loader` and other old loaders
  this.resourcePath = path.join(this.rootContext, item.filename);
  this.resourceQuery = query;

  // For assets modules
  if (this._module && !this._module.matchResource) {
    this._module.matchResource = `${item.filename}${query}`;
  }

  return item.data;
};

loader.raw = true;

module.exports = loader;
