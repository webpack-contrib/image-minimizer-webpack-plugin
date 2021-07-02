import path from "path";
import fileTypeFromBuffer from "./fileTypeFromBuffer";
import { imageminNormalizeConfig } from "./imageminMinify";

/** @typedef {import("../index").DataForMinifyFn} DataForMinifyFn */
/** @typedef {import("../index").ImageminMinimizerOptions} ImageminMinimizerOptions */
/** @typedef {import("../index").MinifyFnResult} MinifyFnResult */

/**
 * @param {DataForMinifyFn} data
 * @param {ImageminMinimizerOptions} minimizerOptions
 * @returns {Promise<MinifyFnResult | MinifyFnResult[]>}
 */
export default async function imageminGenerate(data, minimizerOptions) {
  const [[filename, input]] = Object.entries(data);
  /** @type {MinifyFnResult} */
  const result = {
    filename,
    data: input,
    warnings: [],
    errors: [],
  };

  /** @typedef {import("imagemin").Options} ImageminOptions */

  /** @type {ImageminOptions} */
  const minimizerOptionsNormalized = /** @type {ImageminOptions} */ (
    imageminNormalizeConfig(minimizerOptions, result)
  );
  const { plugins = [] } = minimizerOptionsNormalized;

  if (plugins.length === 0) {
    return result;
  }

  let imagemin;

  try {
    imagemin = require("imagemin");
  } catch (error) {
    result.errors.push(error);

    return result;
  }

  const results = [result];

  for (const plugin of plugins) {
    const resultForPlugin = {
      filename,
      data: input,
      warnings: [],
      errors: [],
      imageminGenerate: true,
    };

    minimizerOptionsNormalized.plugins =
      /** @type {ImageminOptions["plugins"]} */ ([plugin]);

    try {
      // eslint-disable-next-line no-await-in-loop
      resultForPlugin.data = await imagemin.buffer(
        input,
        minimizerOptionsNormalized
      );
    } catch (error) {
      result.errors.push(error);

      continue;
    }

    const extInput = path
      .extname(resultForPlugin.filename)
      .slice(1)
      .toLowerCase();
    const { ext: extOutput } = fileTypeFromBuffer(resultForPlugin.data) || {};

    if (extOutput && extInput !== extOutput) {
      resultForPlugin.filename = resultForPlugin.filename.replace(
        new RegExp(`${extInput}$`),
        `.${extOutput}`
      );
    }

    results.push(resultForPlugin);
  }

  return results;
}
