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
  const targets = {};

  for (const [codec, { extension }] of Object.entries(encoders)) {
    const extensionNormalized = extension.toLowerCase();

    if (extensionNormalized === "jpg") {
      targets.jpeg = codec;
    }

    targets[extensionNormalized] = codec;
  }

  const ext = path.extname(filename).slice(1).toLowerCase();
  const targetCodec = targets[ext];

  if (!targetCodec) {
    return {
      filename,
      data: input,
      warnings: [
        new Error(
          `"${filename}" is not minify, because has an unsupported format`
        ),
      ],
      errors: [],
    };
  }

  const { encodeOptions = {} } = minifyOptions;

  if (!encodeOptions[targetCodec]) {
    encodeOptions[targetCodec] = {};
  }

  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(new Uint8Array(input));

  try {
    await image.encode({ [targetCodec]: encodeOptions[targetCodec] });
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
    squooshMinify: true,
  };
}

export default squooshMinify;
