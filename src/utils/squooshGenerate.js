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
// Todo remove import/no-unresolved comment when "main" section in @squoosh/lib package.json will be fixed
/* istanbul ignore next */
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

  // Todo remove import/no-unresolved comment when "main" section in @squoosh/lib package.json will be fixed
  // @ts-ignore
  // eslint-disable-next-line node/no-unpublished-require,import/no-unresolved
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

  const result = [];
  const ext = path.extname(filename).toLowerCase();

  for (const encodedImage of Object.values(image.encodedWith)) {
    // eslint-disable-next-line no-await-in-loop
    const { extension, binary } = await encodedImage;

    result.push({
      filename: filename.replace(new RegExp(`${ext}$`), `.${extension}`),
      data: Buffer.from(binary),
      warnings: [],
      errors: [],
    });
  }

  return result;
}

export default squooshGenerate;
