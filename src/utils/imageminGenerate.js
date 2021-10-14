import path from "path";
import fileTypeFromBuffer from "./fileTypeFromBuffer";
import { imageminNormalizeConfig } from "./imageminMinify";

/** @typedef {import("../index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("../index").WorkerResult} WorkerResult */
/** @typedef {import("imagemin").Options} ImageminOptions */

/**
 * @param {WorkerResult} original
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<WorkerResult[]>}
 */
async function imageminGenerate(original, minimizerOptions) {
  /** @type {ImageminOptions} */
  const minimizerOptionsNormalized = /** @type {ImageminOptions} */ (
    imageminNormalizeConfig(minimizerOptions)
  );
  const { plugins = [] } = minimizerOptionsNormalized;

  if (plugins.length === 0) {
    return [];
  }

  const imagemin = require("imagemin");

  /** @type {WorkerResult[]} */
  const results = [];

  for (const plugin of plugins) {
    /** @type {WorkerResult} */
    const result = {
      filename: original.filename,
      data: original.data,
      warnings: [],
      errors: [],
      info: { generated: true, generatedBy: ["imagemin"] },
    };

    minimizerOptionsNormalized.plugins =
      /** @type {ImageminOptions["plugins"]} */ ([plugin]);

    try {
      // eslint-disable-next-line no-await-in-loop
      result.data = await imagemin.buffer(
        original.data,
        minimizerOptionsNormalized
      );
    } catch (error) {
      result.errors.push(
        error instanceof Error
          ? error
          : new Error(/** @type {string} */ (error))
      );
      results.push(result);

      continue;
    }

    const { ext: extOutput } = fileTypeFromBuffer(result.data) || {};
    const extInput = path.extname(original.filename).slice(1).toLowerCase();

    if (extOutput && extInput !== extOutput) {
      result.filename = result.filename.replace(
        new RegExp(`${extInput}$`),
        `${extOutput}`
      );
    }

    results.push(result);
  }

  return results;
}

export default imageminGenerate;
