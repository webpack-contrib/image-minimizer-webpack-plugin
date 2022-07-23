const path = require("path");

/** @typedef {import("./index.js").WorkerResult} WorkerResult */
/** @typedef {import("sharp")} SharpLib */
/** @typedef {import("sharp").Sharp} Sharp */
/** @typedef {import("sharp").ResizeOptions} ResizeOptions */

/**
 * @typedef SharpEncodeOptions
 * @type {object}
 * @property {import("sharp").AvifOptions} [avif]
 * @property {import("sharp").GifOptions} [gif]
 * @property {import("sharp").HeifOptions} [heif]
 * @property {import("sharp").JpegOptions} [jpeg]
 * @property {import("sharp").JpegOptions} [jpg]
 * @property {import("sharp").PngOptions} [png]
 * @property {import("sharp").WebpOptions} [webp]
 */

/**
 * @typedef SharpFormat
 * @type {keyof SharpEncodeOptions}
 */

/**
 * @typedef SharpOptions
 * @type {object}
 * @property {ResizeOptions} [resize]
 * @property {SharpEncodeOptions} encodeOptions
 */

// https://github.com/lovell/sharp/blob/e40a881ab4a5e7b0e37ba17e31b3b186aef8cbf6/lib/output.js#L7-L23
const SHARP_FORMATS = new Map([
  ["avif", "avif"],
  ["gif", "gif"],
  ["heic", "heif"],
  ["heif", "heif"],
  ["j2c", "jp2"],
  ["j2k", "jp2"],
  ["jp2", "jp2"],
  ["jpeg", "jpeg"],
  ["jpg", "jpeg"],
  ["jpx", "jp2"],
  ["png", "png"],
  ["raw", "raw"],
  ["tif", "tiff"],
  ["tiff", "tiff"],
  ["webp", "webp"],
]);

/**
 * @param {unknown} error
 * @returns {string}
 */
function messageFromError(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * @param {WorkerResult} original
 * @param {SharpOptions} minimizerOptions
 * @param {SharpFormat | null} targetFormat
 * @returns {Promise<WorkerResult>}
 */
async function sharpTransform(original, minimizerOptions, targetFormat = null) {
  const inputExt = path.extname(original.filename).slice(1).toLowerCase();

  if (!SHARP_FORMATS.has(inputExt)) {
    const error = new Error(
      `Error with '${original.filename}': the 'sharp' image transformer does not support '.${inputExt}' images.`
    );

    original.errors.push(error);
    return original;
  }

  /** @type {SharpLib} */
  // eslint-disable-next-line node/no-unpublished-require
  const sharp = require("sharp");

  /** @type {Sharp} */
  let imagePipeline;

  try {
    imagePipeline = sharp(original.data);
  } catch (error) {
    const newError = new Error(
      `Error with '${original.filename}': ${messageFromError(error)}`
    );

    original.errors.push(newError);
    return original;
  }

  // ====== resize ======

  try {
    if (minimizerOptions.resize?.width || minimizerOptions.resize?.height) {
      imagePipeline.resize(
        minimizerOptions.resize?.width,
        minimizerOptions.resize?.height
      );
    }
  } catch (error) {
    const newError = new Error(
      `Error with '${original.filename}': ${messageFromError(error)}`
    );

    original.errors.push(newError);
    return original;
  }

  // ====== convert ======

  const imageMetadata = await imagePipeline.metadata();

  const outputFormat =
    targetFormat ?? /** @type {SharpFormat} */ (imageMetadata.format);

  const encodeOptions = minimizerOptions.encodeOptions[outputFormat];

  try {
    imagePipeline.toFormat(outputFormat, encodeOptions);
  } catch (error) {
    const newError = new Error(
      `Error with '${original.filename}': ${messageFromError(error)}`
    );

    original.errors.push(newError);
    return original;
  }

  const result = await imagePipeline.toBuffer();

  // ====== rename ======

  const outputExt = targetFormat ? `.${outputFormat}` : `.${inputExt}`;

  const baseFilename = path.basename(original.filename, `.${inputExt}`);
  const filename = `${baseFilename}${outputExt}`;

  return {
    filename,
    data: result,
    warnings: [...original.warnings],
    errors: [...original.errors],
    info: {
      ...original.info,
      generated: true,
      generatedBy:
        original.info && original.info.generatedBy
          ? ["sharp", ...original.info.generatedBy]
          : ["sharp"],
    },
  };
}

/**
 * @param {WorkerResult} original
 * @param {SharpOptions} minimizerOptions
 * @returns {Promise<WorkerResult>}
 */
function sharpGenerate(original, minimizerOptions) {
  if (!minimizerOptions.encodeOptions) {
    const error = new Error(
      `No result from 'sharp' for '${original.filename}', please configure the 'encodeOptions' option to generate images`
    );

    original.errors.push(error);
    return Promise.resolve(original);
  }

  const targetFormats = /** @type {SharpFormat[]} */ (
    Object.keys(minimizerOptions.encodeOptions)
  );

  if (targetFormats.length === 0) {
    const error = new Error(
      `No result from 'sharp' for '${original.filename}', please configure the 'encodeOptions' option to generate images`
    );

    original.errors.push(error);
    return Promise.resolve(original);
  }

  if (targetFormats.length > 1) {
    const error = new Error(
      `Multiple values for the 'encodeOptions' option is not supported for '${original.filename}', specify only one codec for the generator`
    );

    original.errors.push(error);
    return Promise.resolve(original);
  }

  const [targetFormat] = targetFormats;

  return sharpTransform(original, minimizerOptions, targetFormat);
}

/**
 * @param {WorkerResult} original
 * @param {SharpOptions} minimizerOptions
 * @returns {Promise<WorkerResult>}
 */
function sharpMinify(original, minimizerOptions) {
  return sharpTransform(original, minimizerOptions);
}

module.exports = {
  sharpMinify,
  sharpGenerate,
};
