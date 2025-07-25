const path = require("path");

const worker = require("./worker");
const schema = require("./loader-options.json");
const {
  IMAGE_MINIMIZER_PLUGIN_INFO_MAPPINGS,
  ABSOLUTE_URL_REGEX,
  WINDOWS_PATH_REGEX,
} = require("./utils.js");

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("./utils").WorkerResult} WorkerResult */

/**
 * @template T
 * @typedef {import("./index").Minimizer<T>} Minimizer<T>
 */

/**
 * @template T
 * @typedef {import("./index").Generator<T>} Generator<T>
 */

/**
 * @template T
 * @typedef {Object} LoaderOptions<T>
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {Minimizer<T> | Minimizer<T>[]} [minimizer]
 * @property {Generator<T>[]} [generator]
 */

// Workaround - https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/341
/**
 * @template T
 * @param {import("webpack").LoaderContext<LoaderOptions<T>>} loaderContext
 * @param {WorkerResult} output
 * @param {string} query
 */
function changeResource(loaderContext, output, query) {
  loaderContext.resourcePath = path.join(
    loaderContext.rootContext,
    output.filename,
  );
  loaderContext.resourceQuery = query;
}

/**
 * @template T
 * @param {Minimizer<T>[]} transformers
 * @param {string | null} widthQuery
 * @param {string | null} heightQuery
 * @param {string | null} unitQuery
 * @return {Minimizer<T>[]}
 */
function processSizeQuery(transformers, widthQuery, heightQuery, unitQuery) {
  return transformers.map((transformer) => {
    const minimizer = { ...transformer };

    const minimizerOptions =
      /** @type { import("./index").BasicTransformerOptions<T> & { resize?: import("./index").ResizeOptions }} */
      // @ts-ignore
      ({ ...minimizer.options });

    minimizerOptions.resize = { ...minimizerOptions?.resize };
    minimizer.options = minimizerOptions;

    if (widthQuery === "auto") {
      delete minimizerOptions.resize.width;
    } else if (widthQuery) {
      const width = Number.parseInt(widthQuery, 10);

      if (Number.isFinite(width) && width > 0) {
        minimizerOptions.resize.width = width;
      }
    }

    if (heightQuery === "auto") {
      delete minimizerOptions.resize.height;
    } else if (heightQuery) {
      const height = Number.parseInt(heightQuery, 10);

      if (Number.isFinite(height) && height > 0) {
        minimizerOptions.resize.height = height;
      }
    }

    if (unitQuery === "px" || unitQuery === "percent") {
      minimizerOptions.resize.unit = unitQuery;
    }

    return minimizer;
  });
}

/**
 * @template T
 * @this {import("webpack").LoaderContext<LoaderOptions<T>>}
 * @param {Buffer} content
 * @returns {Promise<Buffer | undefined>}
 */
async function loader(content) {
  // Avoid optimize twice
  const imageMinimizerPluginInfo = this._module
    ? IMAGE_MINIMIZER_PLUGIN_INFO_MAPPINGS.get(this._module)
    : undefined;

  if (
    imageMinimizerPluginInfo?.minimized ||
    imageMinimizerPluginInfo?.generated
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
        "Not configured 'minimizer' or 'generator' options, please setup them",
      ),
    );

    return;
  }

  let transformer = minimizer;

  const parsedQuery =
    this.resourceQuery.length > 0
      ? new URLSearchParams(this.resourceQuery)
      : null;

  if (parsedQuery) {
    const presetName = parsedQuery.get("as");

    if (presetName) {
      if (!generator) {
        callback(
          new Error(
            "Please specify the 'generator' option to use 'as' query param for generation purposes.",
          ),
        );

        return;
      }

      const presets = generator.filter((item) => item.preset === presetName);

      if (presets.length > 1) {
        callback(
          new Error(
            "Found several identical preset names, the 'preset' option should be unique",
          ),
        );

        return;
      }

      if (presets.length === 0) {
        callback(
          new Error(
            `Can't find '${presetName}' preset in the 'generator' option`,
          ),
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

  if (parsedQuery) {
    const widthQuery = parsedQuery.get("width") ?? parsedQuery.get("w");
    const heightQuery = parsedQuery.get("height") ?? parsedQuery.get("h");
    const unitQuery = parsedQuery.get("unit") ?? parsedQuery.get("u");

    if (widthQuery || heightQuery || unitQuery) {
      if (Array.isArray(transformer)) {
        transformer = processSizeQuery(
          transformer,
          widthQuery,
          heightQuery,
          unitQuery,
        );
      } else {
        [transformer] = processSizeQuery(
          [transformer],
          widthQuery,
          heightQuery,
          unitQuery,
        );
      }
    }
  }

  const filename =
    ABSOLUTE_URL_REGEX.test(this.resourcePath) &&
    !WINDOWS_PATH_REGEX.test(this.resourcePath)
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
    for (const error of output.errors) {
      this.emitError(error);
    }

    callback(null, content);

    return;
  }

  if (output.warnings && output.warnings.length > 0) {
    for (const warning of output.warnings) {
      this.emitWarning(warning);
    }
  }

  // Change content of the data URI after minimizer
  if (this._module?.resourceResolveData?.encodedContent) {
    const isBase64 = /^base64$/i.test(
      /** @type string */
      (this._module.resourceResolveData.encoding),
    );

    this._module.resourceResolveData.encodedContent = isBase64
      ? output.data.toString("base64")
      : encodeURIComponent(output.data.toString("utf-8")).replace(
          /[!'()*]/g,
          (character) =>
            `%${/** @type {number} */ (character.codePointAt(0)).toString(16)}`,
        );
  } else {
    let query = this.resourceQuery;

    if (parsedQuery) {
      // Remove query param from the bundle due we need that only for bundle purposes
      for (const key of ["as", "width", "w", "height", "h"]) {
        parsedQuery.delete(key);
      }

      query = parsedQuery.toString();
      query = query.length > 0 ? `?${query}` : "";
    }

    // Old approach for `file-loader` and other old loaders
    changeResource(this, output, query);

    // Change name of assets modules after generator
    if (this._module && !this._module.matchResource) {
      this._module.matchResource = `${output.filename}${query}`;
    }
  }

  if (this._module) {
    IMAGE_MINIMIZER_PLUGIN_INFO_MAPPINGS.set(this._module, output.info);
  }

  callback(null, output.data);
}

loader.raw = true;

module.exports = loader;
