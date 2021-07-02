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

async function squooshMinify(data, minifyOptions = {}) {
  const [[filename, input]] = Object.entries(data);
  /** @type {MinifyFnResult} */
  const result = {
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

  const squoosh =
    // eslint-disable-next-line node/no-unpublished-require
    require("@squoosh/lib");

  let imagePool;
  let image;

  try {
    imagePool = new squoosh.ImagePool();
    image = imagePool.ingestImage(input);

    await image.encode(encodeOptions);
  } catch (error) {
    if (imagePool) {
      await imagePool.close();
    }

    result.errors.push(error);

    return result;
  }

  await imagePool.close();

  const encodedImage = await image.encodedWith[targetCodec];

  result.data = Buffer.from(encodedImage.binary);

  return result;
}

export default squooshMinify;
