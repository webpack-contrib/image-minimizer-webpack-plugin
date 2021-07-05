import path from "path";
import fileTypeFromBuffer from "./fileTypeFromBuffer";
import { imageminNormalizeConfig } from "./imageminMinify";

/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */

/**
 * @param {MinifyFnResult} original
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<MinifyFnResult[]>}
 */
async function imageminGenerate(original, minimizerOptions) {
  /** @typedef {import("imagemin").Options} ImageminOptions */

  /** @type {ImageminOptions} */
  const minimizerOptionsNormalized = /** @type {ImageminOptions} */ (
    imageminNormalizeConfig(minimizerOptions, original)
  );
  const { plugins = [] } = minimizerOptionsNormalized;

  if (plugins.length === 0) {
    return [];
  }

  let imagemin;

  try {
    imagemin = require("imagemin");
  } catch (error) {
    original.errors.push(error);

    return [original];
  }

  const extInput = path.extname(original.filename).slice(1).toLowerCase();

  /** @type {MinifyFnResult[]} */
  const results = [];

  for (const plugin of plugins) {
    /** @type {MinifyFnResult} */
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
      result.errors.push(error);
      results.push(result);

      continue;
    }

    const { ext: extOutput } = fileTypeFromBuffer(result.data) || {};

    if (extOutput && extInput !== extOutput) {
      result.filename = result.filename.replace(
        new RegExp(`${extInput}$`),
        `${extOutput}`
      );
    }

    if (result.info) {
      result.info.related = { generated: result.filename };
    }

    results.push(result);
  }

  return results;
}

export default imageminGenerate;
