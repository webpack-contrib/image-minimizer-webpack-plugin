import path from "path";

/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */

/**
 * @param {MinifyFnResult} original
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<MinifyFnResult>}
 */

async function squooshMinify(original, minifyOptions) {
  let squoosh;

  try {
    // eslint-disable-next-line node/no-unpublished-require
    squoosh = require("@squoosh/lib");
  } catch (error) {
    original.errors.push(error);

    return original;
  }

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

  const ext = path.extname(original.filename).slice(1).toLowerCase();
  const targetCodec = targets[ext];

  if (!targetCodec) {
    original.warnings.push(
      new Error(
        `"${original.filename}" is not minimized, because has an unsupported format`
      )
    );

    return original;
  }

  const { encodeOptions = {} } = minifyOptions;

  if (!encodeOptions[targetCodec]) {
    encodeOptions[targetCodec] = {};
  }

  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(new Uint8Array(original.data));

  try {
    await image.encode({ [targetCodec]: encodeOptions[targetCodec] });
  } catch (error) {
    await imagePool.close();

    original.errors.push(error);

    return original;
  }

  await imagePool.close();

  const encodedImage = await image.encodedWith[targets[ext]];

  return {
    filename: original.filename,
    data: Buffer.from(encodedImage.binary),
    warnings: [...original.warnings],
    errors: [...original.errors],
    info: {
      ...original.info,
      minimized: true,
      minimizedBy:
        original.info && original.info.minimizedBy
          ? ["squoosh", ...original.info.minimizedBy]
          : ["squoosh"],
    },
  };
}

export default squooshMinify;
