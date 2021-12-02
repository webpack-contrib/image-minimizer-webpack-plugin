import path from "path";

import worker from "./worker";
import schema from "./loader-options.json";
import { imageminMinify } from "./utils.js";

/** @typedef {import("./index").FilterFn} FilterFn */
/** @typedef {import("./index").Rules} Rules */
/** @typedef {import("./index").Minimizer} Minimizer */
/** @typedef {import("./index").Generator} Generator */
/** @typedef {import("./index").InternalWorkerOptions} InternalWorkerOptions */
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").LoaderContext<LoaderOptions>} LoaderContext */
/** @typedef {import("webpack").Compilation} Compilation */

/**
 * @typedef {Object} LoaderOptions
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {string} [filename] Allows to set the filename for the generated asset. Useful for converting to a `webp`.
 * @property {Minimizer} [minimizer]
 * @property {Generator[]} [generator]
 */

/**
 * @this {LoaderContext}
 * @param {Buffer} content
 */
module.exports = async function loader(content) {
  // @ts-ignore
  const options = this.getOptions(/** @type {Schema} */ (schema));
  const callback = this.async();
  const { generator, minimizer, severityError } = options;

  let transformer = minimizer || { implementation: imageminMinify };
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
      // TODO should be unique
      const preset = generator.find((item) => item.preset === as);

      if (!preset) {
        callback(
          new Error(`Can't find '${preset}' preset in the 'generator' option.`)
        );

        return;
      }

      transformer = preset;
      isGenerator = true;
    }
  }

  const name = path.relative(this.rootContext, this.resourcePath);
  const minifyOptions = /** @type {InternalWorkerOptions} */ ({
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

    // TODO check watch/resolver
    // TODO change `resource` too
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
