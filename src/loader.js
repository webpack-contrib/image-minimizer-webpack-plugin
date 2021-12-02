import path from "path";

import worker from "./worker";
import schema from "./loader-options.json";

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
  // @ts-ignore
  const options = this.getOptions(/** @type {Schema} */ (schema));
  const callback = this.async();
  const { generator, minimizer, severityError } = options;

  let transformer = minimizer;
  let isGenerator = false;
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
      isGenerator = true;
    }
  }

  if (!transformer) {
    callback(
      new Error(
        "Not configured 'minimizer' or 'generator' options, please setup them"
      )
    );

    return;
  }

  const name = path.relative(this.rootContext, this.resourcePath);
  const minifyOptions =
    /** @type {import("./index").InternalWorkerOptions<T>} */ ({
      input: content,
      filename: name,
      severityError,
      transformer,
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

  if (isGenerator && parsedQuery) {
    parsedQuery.delete("as");

    const stringifiedParsedQuery = parsedQuery.toString();
    const query =
      stringifiedParsedQuery.length > 0 ? `?${stringifiedParsedQuery}` : "";

    // For `file-loader` and other old loaders
    this.resourcePath = path.join(this.rootContext, output.filename);
    this.resourceQuery = query;

    // For assets modules
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
