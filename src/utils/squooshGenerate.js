import path from "path";

/** @typedef {import("../index").WorkerResult} WorkerResult */
/** @typedef {import("../index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("imagemin").Options} ImageminOptions */

/**
 * @param {WorkerResult} original
 * @param {SquooshMinimizerOptions} minifyOptions
 * @returns {Promise<WorkerResult[]>}
 */

async function squooshGenerate(original, minifyOptions) {
  const { encodeOptions } = minifyOptions;

  if (typeof encodeOptions === "undefined") {
    return [];
  }

  // eslint-disable-next-line node/no-unpublished-require
  const squoosh = require("@squoosh/lib");
  const { ImagePool } = squoosh;
  // TODO https://github.com/GoogleChromeLabs/squoosh/issues/1111
  const imagePool = new ImagePool(1);
  const image = imagePool.ingestImage(new Uint8Array(original.data));

  try {
    await image.encode(encodeOptions);
  } catch (error) {
    await imagePool.close();

    original.errors.push(
      error instanceof Error ? error : new Error(/** @type {string} */ (error))
    );

    return [original];
  }

  await imagePool.close();

  /** @type {WorkerResult[]} */
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
