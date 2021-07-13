import path from "path";

/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */

/**
 * @param {MinifyFnResult} original
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<MinifyFnResult[]>}
 */

async function squooshGenerate(original, minifyOptions) {
  const { encodeOptions } = minifyOptions;

  if (typeof encodeOptions === "undefined") {
    return [];
  }

  // eslint-disable-next-line node/no-unpublished-require
  const squoosh = require("@squoosh/lib");
  const { ImagePool } = squoosh;
  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(new Uint8Array(original.data));

  try {
    await image.encode(encodeOptions);
  } catch (error) {
    await imagePool.close();

    original.errors.push(error);

    return [original];
  }

  await imagePool.close();

  /** @type {MinifyFnResult[]} */
  const results = [];
  const ext = path.extname(original.filename).toLowerCase();
  const tasks = [];

  for (const encodedImage of Object.values(image.encodedWith)) {
    tasks.push(encodedImage);
  }

  const encodedImages = await Promise.all(tasks);

  for (const encodedImage of encodedImages) {
    const { extension, binary } = encodedImage;
    const newFilename = original.filename.replace(
      new RegExp(`${ext}$`),
      `.${extension}`
    );

    results.push({
      filename: newFilename,
      data: Buffer.from(binary),
      warnings: [],
      errors: [],
      info: { generated: true, generatedBy: ["squoosh"] },
    });
  }

  return results;
}

export default squooshGenerate;
