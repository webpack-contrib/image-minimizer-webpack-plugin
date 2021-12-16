const path = require("path");

const worker = require("./worker");
const schema = require("./loader-options.json");
const { isAbsoluteURL } = require("./utils.js");

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compilation} Compilation */

/**
 * @template T
 * @typedef {Object} LoaderOptions<T>
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {import("./index").Minimizer<T> | import("./index").Minimizer<T>[]} [minimizer]
 * @property {import("./index").Generator<T>[]} [generator]
 */

/**
 * @template T
 * @this {import("webpack").LoaderContext<LoaderOptions<T>>}
 * @param {Buffer} content
 */
module.exports = async function loader(content) {
  // Avoid optimize twice
  if (
    this._module &&
    this._module.buildMeta &&
    this._module.buildMeta.imageMinimizerPluginInfo &&
    (this._module.buildMeta.imageMinimizerPluginInfo.minimized ||
      this._module.buildMeta.imageMinimizerPluginInfo.generated)
  ) {
    return content;
  }

  // @ts-ignore
  const options = this.getOptions(/** @type {Schema} */ (schema));
  const callback = this.async();
  const { generator, minimizer, severityError } = options;

  if (!minimizer && !generator) {
    callback(
      new Error(
        "Not configured 'minimizer' or 'generator' options, please setup them"
      )
    );

    return;
  }

  let transformer = minimizer;
  let parsedQuery;

  if (this.resourceQuery.length > 0) {
    parsedQuery = new URLSearchParams(this.resourceQuery);

    if (parsedQuery.has("as")) {
      if (!generator) {
        callback(
          new Error(
            "Please specify the 'generator' option to use 'as' query param for generation purposes."
          )
        );

        return;
      }

      const as = parsedQuery.get("as");
      const presets = generator.filter((item) => item.preset === as);

      if (presets.length > 1) {
        callback(
          new Error(
            "Found several identical pereset names, the 'preset' option should be unique"
          )
        );

        return;
      }

      if (presets.length === 0) {
        callback(
          new Error(`Can't find '${as}' preset in the 'generator' option`)
        );

        return;
      }

      [transformer] = presets;
    }
  }

  if (!transformer) {
    callback(null, content);

    return;
  }

  const isAbsolute = isAbsoluteURL(this.resourcePath);
  const filename = isAbsolute
    ? this.resourcePath
    : path.relative(this.rootContext, this.resourcePath);
  const minifyOptions =
    /** @type {import("./index").InternalWorkerOptions<T>} */ ({
      input: content,
      filename,
      severityError,
      transformer,
      generateFilename:
        /** @type {Compilation} */
        (this._compilation).getAssetPath.bind(this._compilation),
    });

  const output = await worker(minifyOptions);

  if (output.errors && output.errors.length > 0) {
    output.errors.forEach((error) => {
      this.emitError(error);
    });

    callback(null, content);

    return;
  }

  if (output.warnings && output.warnings.length > 0) {
    output.warnings.forEach((warning) => {
      this.emitWarning(warning);
    });
  }

  // Change content of the data URI after minimizer
  if (
    this._module &&
    this._module.resourceResolveData &&
    this._module.resourceResolveData.encodedContent
  ) {
    // console.log(content.toString())
    this._module.resourceResolveData.encodedContent =
      output.data.toString("base64");
  } else {
    let query = this.resourceQuery;

    if (parsedQuery) {
      // Remove query param from the bundle due we need that only for bundle purposes
      const stringifiedParsedQuery = parsedQuery.toString();

      query =
        stringifiedParsedQuery.length > 0 ? `?${stringifiedParsedQuery}` : "";
      parsedQuery.delete("as");
    }

    // Old approach for `file-loader` and other old loaders
    this.resourcePath = isAbsolute
      ? output.filename
      : path.join(this.rootContext, output.filename);
    this.resourceQuery = query;

    // Change name of assets modules after generator
    if (this._module && !this._module.matchResource) {
      this._module.matchResource = `${output.filename}${query}`;
    }
  }

  // TODO: search better API
  if (this._module) {
    this._module.buildMeta = {
      ...this._module.buildMeta,
      imageMinimizerPluginInfo: output.info,
    };
  }

  callback(null, output.data);
};

module.exports.raw = true;
