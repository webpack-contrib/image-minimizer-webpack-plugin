const path = require("node:path");

const schema = require("./loader-options.json");
const {
  ABSOLUTE_URL_REGEX,
  IMAGE_MINIMIZER_PLUGIN_INFO_MAPPINGS,
  WINDOWS_PATH_REGEX,
} = require("./utils.js");
const worker = require("./worker");

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
 * @typedef {object} LoaderOptions<T>
 * @property {string=} severityError allows to choose how errors are displayed.
 * @property {Minimizer<T> | Minimizer<T>[]=} minimizer minimizer configuration
 * @property {Generator<T>[]=} generator generator configuration
 */

// Workaround - https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/341
/**
 * @template T
 * @param {import("webpack").LoaderContext<LoaderOptions<T>>} loaderContext loader context
 * @param {WorkerResult} output worker result
 * @param {string} query query string
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
 * @param {Minimizer<T>[]} transformers transformers
 * @param {string | null} widthQuery width query
 * @param {string | null} heightQuery height query
 * @param {string | null} unitQuery unit query
 * @returns {Minimizer<T>[]} processed transformers
 */
function processSizeQuery(transformers, widthQuery, heightQuery, unitQuery) {
  return transformers.map((transformer) => {
    const minimizer = { ...transformer };

    const minimizerOptions = {
      .../** @type {{ options: import("./index").BasicTransformerOptions<T> & { resize?: import("./index").ResizeOptions  }}} */
      (minimizer).options,
    };

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
 * @param {Buffer} content content
 * @returns {Promise<Buffer | undefined>} processed content
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
      : encodeURIComponent(output.data.toString("utf8")).replaceAll(
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
