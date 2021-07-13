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

/** @typedef {import("webpack").RawLoaderDefinition<LoaderOptions>} ImageMinimizerRawLoaderDefinition */

/**
 * @type {ImageMinimizerRawLoaderDefinition}
 */
// @ts-ignore Due workaround for renaming modules
// eslint-disable-next-line func-style
const loader = async function (content) {
  const options = this.getOptions(/** @type {Schema} */ (schema));

  const name = path.relative(this.rootContext, this.resourcePath);
  const parsedQuery = new URLSearchParams(this.resourceQuery);
  const compilation = /** @type {Compilation} */ (this._compilation);
  const minifyOptions = /** @type {InternalMinifyOptions} */ ({
    filename: name,
    input: content,
    info: {},
    minify: options.minify || imageminMinify,
    minimizerOptions: options.minimizerOptions,
    severityError: options.severityError,
    generateFilename: compilation.getAssetPath.bind(compilation),
  });
  const preset = parsedQuery.get("preset");
  const output = await minify(minifyOptions);

  /**
   * @type {MinifyFnResult | undefined}
   */
  const item = preset
    ? output.find((possibleItem) => possibleItem.filename.endsWith(preset))
    : output[0];

  if (!item) {
    throw new Error("Can't found preset");
  }

  item.errors.forEach((error) => {
    this.emitError(error);
  });

  item.warnings.forEach((warning) => {
    this.emitWarning(warning);
  });

  parsedQuery.delete("preset");

  const stringifiedParsedQuery = parsedQuery.toString();
  const query =
    stringifiedParsedQuery.length > 0 ? `?${stringifiedParsedQuery}` : "";

  // TODO check watch/resolver
  // TODO change `resource` too
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
