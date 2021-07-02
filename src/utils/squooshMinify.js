import path from "path";

/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */

/**
 * @param {DataForMinifyFn} data
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<MinifyFnResult>}
 */

async function squooshMinify(data, minifyOptions) {
  const [[filename, input]] = Object.entries(data);
  /** @type {MinifyFnResult} */
  const result = {
    filename,
    data: input,
    warnings: [],
    errors: [],
  };

  /**
   * @type {Record<string, string>}
   */
  const targets = {
    ".png": "oxipng",
    ".jpg": "mozjpeg",
    ".jpeg": "mozjpeg",
    ".jxl": "jxl",
    ".webp": "webp",
    ".avif": "avif",
    ...minifyOptions.targets,
  };
  const ext = path.extname(filename).toLowerCase();
  const targetCodec = targets[ext];

  if (!targetCodec) {
    result.warnings.push(
      new Error(
        `The "${filename}" was not minified by "ImageMinimizerPlugin.squooshMinify". ${ext} extension is not supported".`
      )
    );

    return result;
  }

  const encodeOptions = {
    [targetCodec]: {},
    ...minifyOptions.encodeOptions,
  };

  // eslint-disable-next-line node/no-unpublished-require
  const squoosh = require("@squoosh/lib");
  const { ImagePool } = squoosh;
  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(input);

  try {
    await image.encode(encodeOptions);
  } catch (error) {
    await imagePool.close();

    result.errors.push(error);

    return result;
  }

  await imagePool.close();

  const encodedImage = await image.encodedWith[targetCodec];

  result.data = Buffer.from(encodedImage.binary);
  result.type = "minimized";

  return result;
}

export default squooshMinify;
