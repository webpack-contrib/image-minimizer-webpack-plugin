import path from "path";

/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").MinifyResult} MinifyResult */

/**
 * @param {MinifyResult} original
 * @param {SquooshMinimizerOptions} options
 * @returns {Promise<MinifyResult>}
 */

async function squooshMinify(original, options) {
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

  const { encodeOptions = {} } = options;

  if (!encodeOptions[targetCodec]) {
    encodeOptions[targetCodec] = {};
  }

  const imagePool = new ImagePool(1);
  const image = imagePool.ingestImage(new Uint8Array(original.data));

  try {
    await image.encode({ [targetCodec]: encodeOptions[targetCodec] });
  } catch (error) {
    await imagePool.close();

    original.errors.push(
      error instanceof Error ? error : new Error(/** @type {string} */ (error))
    );

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
