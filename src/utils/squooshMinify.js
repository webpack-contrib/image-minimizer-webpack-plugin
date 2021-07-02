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

  // eslint-disable-next-line node/no-unpublished-require
  const squoosh = require("@squoosh/lib");
  const { ImagePool, encoders } = squoosh;

  /**
   * @type {Record<string, string>}
   */
  const targets = {
    jpeg: "mozjpeg",
  };

  for (const [codec, { extension }] of Object.entries(encoders)) {
    targets[extension.toLowerCase()] = codec;
  }

  const ext = path.extname(filename).slice(1).toLowerCase();
  const targetCodec = targets[ext];
  const { encodeOptions = {} } = minifyOptions;

  if (!encodeOptions[targetCodec]) {
    encodeOptions[targetCodec] = {};
  }

  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(input);

  try {
    await image.encode(encodeOptions);
  } catch (error) {
    await imagePool.close();

    return {
      filename,
      data: input,
      warnings: [],
      errors: [error],
    };
  }

  await imagePool.close();

  const encodedImage = await image.encodedWith[targets[ext]];

  return {
    filename,
    data: Buffer.from(encodedImage.binary),
    warnings: [],
    errors: [],
    type: "minimized",
  };
}

export default squooshMinify;
