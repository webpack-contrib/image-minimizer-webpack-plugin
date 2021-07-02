import path from "path";

/** @typedef {import("webpack").WebpackError} WebpackError */
/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */

/**
 * @param {DataForMinifyFn} data
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<MinifyFnResult | MinifyFnResult[]>}
 */

async function squooshGenerate(data, minifyOptions) {
  const [[filename, input]] = Object.entries(data);
  const { encodeOptions } = minifyOptions;

  if (typeof encodeOptions === "undefined") {
    return {
      filename,
      data: input,
      warnings: [],
      errors: [],
    };
  }

  // eslint-disable-next-line node/no-unpublished-require
  const squoosh = require("@squoosh/lib");
  const { ImagePool } = squoosh;
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

  const results = [];
  const ext = path.extname(filename).toLowerCase();
  const tasks = [];

  for (const encodedImage of Object.values(image.encodedWith)) {
    tasks.push(encodedImage);
  }

  const encodedImages = await Promise.all(tasks);

  for (const encodedImage of encodedImages) {
    const { extension, binary } = encodedImage;

    results.push({
      filename: filename.replace(new RegExp(`${ext}$`), `.${extension}`),
      data: Buffer.from(binary),
      warnings: [],
      errors: [],
      type: "generated",
    });
  }

  return results;
}

export default squooshGenerate;
