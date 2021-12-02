import path from "path";

/** @typedef {import("./index").WorkerResult} WorkerResult */
/** @typedef {import("./index").SquooshMinimizerOptions} SquooshMinimizerOptions */
/** @typedef {import("imagemin").Options} ImageminOptions */
/** @typedef {import("webpack").WebpackError} WebpackError */

const notSettled = Symbol("not-settled");

/**
 * @template T
 * @typedef {() => Promise<T>} Task
 */

/**
 * Run tasks with limited concurency.
 * @template T
 * @param {number} limit - Limit of tasks that run at once.
 * @param {Task<T>[]} tasks - List of tasks to run.
 * @returns {Promise<T[]>} A promise that fulfills to an array of the results
 */
function throttleAll(limit, tasks) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError(
      `Expected 'limit' to be a finite number > 0, got \`${limit}\` (${typeof limit})`
    );
  }

  if (
    !Array.isArray(tasks) ||
    !tasks.every((task) => typeof task === "function")
  ) {
    throw new TypeError(
      "Expected 'tasks' to be a list of functions returning a promise"
    );
  }

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line unicorn/new-for-builtins
    const result = Array(tasks.length).fill(notSettled);
    const entries = tasks.entries();
    const next = () => {
      const { done, value } = entries.next();

      if (done) {
        const isLast = !result.includes(notSettled);

        if (isLast) {
          // eslint-disable-next-line node/callback-return
          resolve(result);
        }

        return;
      }

      const [index, task] = value;

      /**
       * @param {T} i
       */
      const onFulfilled = (i) => {
        result[index] = i;
        next();
      };

      task().then(onFulfilled, reject);
    };

    // eslint-disable-next-line unicorn/new-for-builtins
    Array(limit).fill(0).forEach(next);
  });
}

/**
 * @callback Uint8ArrayUtf8ByteString
 * @param {number[] | Uint8Array} array
 * @param {number} start
 * @param {number} end
 * @returns {string}
 */

/** @type {Uint8ArrayUtf8ByteString} */
const uint8ArrayUtf8ByteString = (array, start, end) =>
  String.fromCodePoint(...array.slice(start, end));

/**
 * @callback StringToBytes
 * @param {string} string
 * @returns {number[]}
 */

/** @type {StringToBytes} */
const stringToBytes = (string) =>
  // eslint-disable-next-line unicorn/prefer-code-point
  [...string].map((character) => character.charCodeAt(0));

/**
 * @param {ArrayBuffer | ArrayLike<number>} input
 * @returns {{ext: string, mime: string} | undefined}
 */
function fileTypeFromBuffer(input) {
  if (
    !(
      input instanceof Uint8Array ||
      input instanceof ArrayBuffer ||
      Buffer.isBuffer(input)
    )
  ) {
    throw new TypeError(
      `Expected the \`input\` argument to be of type \`Uint8Array\` or \`Buffer\` or \`ArrayBuffer\`, got \`${typeof input}\``
    );
  }

  const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);

  if (!(buffer && buffer.length > 1)) {
    return;
  }

  /**
   * @param {number[]} header
   * @param {{offset: number, mask?: number[]}} [options]
   * @returns {boolean}
   */
  const check = (header, options) => {
    // eslint-disable-next-line no-param-reassign
    options = {
      offset: 0,
      ...options,
    };

    for (let i = 0; i < header.length; i++) {
      if (options.mask) {
        // eslint-disable-next-line no-bitwise
        if (header[i] !== (options.mask[i] & buffer[i + options.offset])) {
          return false;
        }
      } else if (header[i] !== buffer[i + options.offset]) {
        return false;
      }
    }

    return true;
  };

  /**
   * @param {string} header
   * @param {{offset: number, mask?: number[]}} [options]
   * @returns {boolean}
   */
  const checkString = (header, options) =>
    check(stringToBytes(header), options);

  if (check([0xff, 0xd8, 0xff])) {
    return {
      ext: "jpg",
      mime: "image/jpeg",
    };
  }

  if (check([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    // APNG format (https://wiki.mozilla.org/APNG_Specification)
    // 1. Find the first IDAT (image data) chunk (49 44 41 54)
    // 2. Check if there is an "acTL" chunk before the IDAT one (61 63 54 4C)

    // Offset calculated as follows:
    // - 8 bytes: PNG signature
    // - 4 (length) + 4 (chunk type) + 13 (chunk data) + 4 (CRC): IHDR chunk
    const startIndex = 33;
    const firstImageDataChunkIndex = buffer.findIndex(
      (el, i) =>
        i >= startIndex &&
        buffer[i] === 0x49 &&
        buffer[i + 1] === 0x44 &&
        buffer[i + 2] === 0x41 &&
        buffer[i + 3] === 0x54
    );
    const sliced = buffer.subarray(startIndex, firstImageDataChunkIndex);

    if (
      sliced.findIndex(
        (el, i) =>
          sliced[i] === 0x61 &&
          sliced[i + 1] === 0x63 &&
          sliced[i + 2] === 0x54 &&
          sliced[i + 3] === 0x4c
      ) >= 0
    ) {
      return {
        ext: "apng",
        mime: "image/apng",
      };
    }

    return {
      ext: "png",
      mime: "image/png",
    };
  }

  if (check([0x47, 0x49, 0x46])) {
    return {
      ext: "gif",
      mime: "image/gif",
    };
  }

  if (check([0x57, 0x45, 0x42, 0x50], { offset: 8 })) {
    return {
      ext: "webp",
      mime: "image/webp",
    };
  }

  if (check([0x46, 0x4c, 0x49, 0x46])) {
    return {
      ext: "flif",
      mime: "image/flif",
    };
  }

  // `cr2`, `orf`, and `arw` need to be before `tif` check
  if (
    (check([0x49, 0x49, 0x2a, 0x0]) || check([0x4d, 0x4d, 0x0, 0x2a])) &&
    check([0x43, 0x52], { offset: 8 })
  ) {
    return {
      ext: "cr2",
      mime: "image/x-canon-cr2",
    };
  }

  if (check([0x49, 0x49, 0x52, 0x4f, 0x08, 0x00, 0x00, 0x00, 0x18])) {
    return {
      ext: "orf",
      mime: "image/x-olympus-orf",
    };
  }

  if (
    check([0x49, 0x49, 0x2a, 0x00]) &&
    (check([0x10, 0xfb, 0x86, 0x01], { offset: 4 }) ||
      check([0x08, 0x00, 0x00, 0x00], { offset: 4 })) &&
    // This pattern differentiates ARW from other TIFF-ish file types:
    check(
      [
        0x00, 0xfe, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
        0x00, 0x03, 0x01,
      ],
      { offset: 9 }
    )
  ) {
    return {
      ext: "arw",
      mime: "image/x-sony-arw",
    };
  }

  if (
    check([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]) &&
    (check([0x2d, 0x00, 0xfe, 0x00], { offset: 8 }) ||
      check([0x27, 0x00, 0xfe, 0x00], { offset: 8 }))
  ) {
    return {
      ext: "dng",
      mime: "image/x-adobe-dng",
    };
  }

  if (
    check([0x49, 0x49, 0x2a, 0x00]) &&
    check([0x1c, 0x00, 0xfe, 0x00], { offset: 8 })
  ) {
    return {
      ext: "nef",
      mime: "image/x-nikon-nef",
    };
  }

  if (
    check([
      0x49, 0x49, 0x55, 0x00, 0x18, 0x00, 0x00, 0x00, 0x88, 0xe7, 0x74, 0xd8,
    ])
  ) {
    return {
      ext: "rw2",
      mime: "image/x-panasonic-rw2",
    };
  }

  // `raf` is here just to keep all the raw image detectors together.
  if (checkString("FUJIFILMCCD-RAW")) {
    return {
      ext: "raf",
      mime: "image/x-fujifilm-raf",
    };
  }

  if (check([0x49, 0x49, 0x2a, 0x0]) || check([0x4d, 0x4d, 0x0, 0x2a])) {
    return {
      ext: "tif",
      mime: "image/tiff",
    };
  }

  if (check([0x42, 0x4d])) {
    return {
      ext: "bmp",
      mime: "image/bmp",
    };
  }

  if (check([0x49, 0x49, 0xbc])) {
    return {
      ext: "jxr",
      mime: "image/vnd.ms-photo",
    };
  }

  if (check([0x38, 0x42, 0x50, 0x53])) {
    return {
      ext: "psd",
      mime: "image/vnd.adobe.photoshop",
    };
  }

  if (
    checkString("ftyp", { offset: 4 }) &&
    // eslint-disable-next-line no-bitwise
    (buffer[8] & 0x60) !== 0x00 // Brand major, first character ASCII?
  ) {
    // They all can have MIME `video/mp4` except `application/mp4` special-case which is hard to detect.
    // For some cases, we're specific, everything else falls to `video/mp4` with `mp4` extension.
    const brandMajor = uint8ArrayUtf8ByteString(buffer, 8, 12)
      .replace("\0", " ")
      .trim();

    // eslint-disable-next-line default-case
    switch (brandMajor) {
      case "avif":
        return { ext: "avif", mime: "image/avif" };
      case "mif1":
        return { ext: "heic", mime: "image/heif" };
      case "msf1":
        return { ext: "heic", mime: "image/heif-sequence" };
      case "heic":
      case "heix":
        return { ext: "heic", mime: "image/heic" };
      case "hevc":
      case "hevx":
        return { ext: "heic", mime: "image/heic-sequence" };
    }
  }

  if (check([0x00, 0x00, 0x01, 0x00])) {
    return {
      ext: "ico",
      mime: "image/x-icon",
    };
  }

  if (check([0x00, 0x00, 0x02, 0x00])) {
    return {
      ext: "cur",
      mime: "image/x-icon",
    };
  }

  if (check([0x42, 0x50, 0x47, 0xfb])) {
    return {
      ext: "bpg",
      mime: "image/bpg",
    };
  }

  if (
    check([
      0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a,
    ])
  ) {
    // JPEG-2000 family

    if (check([0x6a, 0x70, 0x32, 0x20], { offset: 20 })) {
      return {
        ext: "jp2",
        mime: "image/jp2",
      };
    }

    if (check([0x6a, 0x70, 0x78, 0x20], { offset: 20 })) {
      return {
        ext: "jpx",
        mime: "image/jpx",
      };
    }

    if (check([0x6a, 0x70, 0x6d, 0x20], { offset: 20 })) {
      return {
        ext: "jpm",
        mime: "image/jpm",
      };
    }

    if (check([0x6d, 0x6a, 0x70, 0x32], { offset: 20 })) {
      return {
        ext: "mj2",
        mime: "image/mj2",
      };
    }
  }

  if (
    check([0xff, 0x0a]) ||
    check([
      0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a,
    ])
  ) {
    return {
      ext: "jxl",
      mime: "image/jxl",
    };
  }

  if (
    check([
      0xab, 0x4b, 0x54, 0x58, 0x20, 0x31, 0x31, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a,
    ])
  ) {
    return {
      ext: "ktx",
      mime: "image/ktx",
    };
  }
}

/**
 * @typedef {Object} MetaData
 * @property {Array<Error>} warnings
 * @property {Array<Error>} errors
 */

class InvalidConfigError extends Error {
  /**
   * @param {string | undefined} message
   */
  constructor(message) {
    super(message);

    this.name = "InvalidConfigError";
  }
}

/**
 * @template T
 * @param {ImageminOptions} imageminConfig
 * @returns {Promise<ImageminOptions>}
 */
async function imageminNormalizeConfig(imageminConfig) {
  if (
    !imageminConfig ||
    !imageminConfig.plugins ||
    (imageminConfig.plugins && imageminConfig.plugins.length === 0)
  ) {
    throw new Error(
      "No plugins found for `imagemin`, please read documentation"
    );
  }

  /**
   * @type {import("imagemin").Plugin[]}
   */
  const plugins = [];

  for (const plugin of imageminConfig.plugins) {
    const isPluginArray = Array.isArray(plugin);

    if (typeof plugin === "string" || isPluginArray) {
      const pluginName = isPluginArray ? plugin[0] : plugin;
      const pluginOptions = isPluginArray ? plugin[1] : undefined;

      let requiredPlugin = null;
      let requiredPluginName = `imagemin-${pluginName}`;

      try {
        // @ts-ignore
        // eslint-disable-next-line no-await-in-loop
        requiredPlugin = (await import(requiredPluginName)).default(
          pluginOptions
        );
      } catch {
        requiredPluginName = pluginName;

        try {
          // @ts-ignore
          // eslint-disable-next-line no-await-in-loop
          requiredPlugin = (await import(requiredPluginName)).default(
            pluginOptions
          );
        } catch {
          const pluginNameForError = pluginName.startsWith("imagemin")
            ? pluginName
            : `imagemin-${pluginName}`;

          throw new Error(
            `Unknown plugin: ${pluginNameForError}\n\nDid you forget to install the plugin?\nYou can install it with:\n\n$ npm install ${pluginNameForError} --save-dev\n$ yarn add ${pluginNameForError} --dev`
          );
        }
        // Nothing
      }

      // let version = "unknown";

      // try {
      //   // eslint-disable-next-line import/no-dynamic-require
      //   ({ version } = require(`${requiredPluginName}/package.json`));
      // } catch {
      //   // Nothing
      // }

      // /** @type {Array<Object>} imageminConfig.pluginsMeta */
      // pluginsMeta.push([
      //   {
      //     name: requiredPluginName,
      //     options: pluginOptions || {},
      //     version,
      //   },
      // ]);

      plugins.push(requiredPlugin);
    } else {
      throw new InvalidConfigError(
        `Invalid plugin configuration '${JSON.stringify(
          plugin
        )}', plugin configuration should be 'string' or '[string, object]'"`
      );
    }
  }

  return { plugins };
}

/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minimizerOptions
 * @returns {Promise<WorkerResult>}
 */
async function imageminGenerate(original, minimizerOptions) {
  const minimizerOptionsNormalized = /** @type {ImageminOptions} */ (
    await imageminNormalizeConfig(
      /** @type {ImageminOptions} */ (/** @type {?} */ (minimizerOptions || {}))
    )
  );

  // @ts-ignore
  const imagemin = (await import("imagemin")).default;

  let result;

  try {
    // @ts-ignore
    result = await imagemin.buffer(original.data, minimizerOptionsNormalized);
  } catch (error) {
    original.errors.push(
      error instanceof Error ? error : new Error(/** @type {string} */ (error))
    );

    return original;
  }

  const { ext: extOutput } = fileTypeFromBuffer(result) || {};
  const extInput = path.extname(original.filename).slice(1).toLowerCase();

  let newFilename = original.filename;

  if (extOutput && extInput !== extOutput) {
    newFilename = original.filename.replace(
      new RegExp(`${extInput}$`),
      `${extOutput}`
    );
  }

  return {
    filename: newFilename,
    data: result,
    warnings: [...original.warnings],
    errors: [...original.errors],
    info: {
      ...original.info,
      generated: true,
      generatedBy:
        original.info && original.info.generatedBy
          ? ["imagemin", ...original.info.generatedBy]
          : ["imagemin"],
    },
  };
}

/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} options
 * @returns {Promise<WorkerResult>}
 */
async function imageminMinify(original, options) {
  const minimizerOptionsNormalized = /** @type {ImageminOptions} */ (
    await imageminNormalizeConfig(
      /** @type {ImageminOptions} */ (/** @type {?} */ (options || {}))
    )
  );

  // @ts-ignore
  const imagemin = (await import("imagemin")).default;

  let result;

  try {
    // @ts-ignore
    result = await imagemin.buffer(original.data, minimizerOptionsNormalized);
  } catch (error) {
    original.errors.push(
      error instanceof Error ? error : new Error(/** @type {string} */ (error))
    );

    return original;
  }

  // TODO fix me
  // const extInput = path.extname(original.filename).slice(1).toLowerCase();
  // const { ext: extOutput } = fileTypeFromBuffer(result) || {};
  //
  // if (extOutput && extInput !== extOutput) {
  //   original.warnings.push(
  //     new Error(
  //       `"imageminMinify" function do not support generate to "${extOutput}" from "${original.filename}". Please use "imageminGenerate" function.`
  //     )
  //   );
  //
  //   return original;
  // }

  return {
    filename: original.filename,
    data: result,
    warnings: [...original.warnings],
    errors: [...original.errors],
    info: {
      ...original.info,
      minimized: true,
      minimizedBy:
        original.info && original.info.minimizedBy
          ? ["imagemin", ...original.info.minimizedBy]
          : ["imagemin"],
    },
  };
}

/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} minifyOptions
 * @returns {Promise<WorkerResult>}
 */
async function squooshGenerate(original, minifyOptions) {
  // eslint-disable-next-line node/no-unpublished-require
  const squoosh = require("@squoosh/lib");
  const { ImagePool } = squoosh;
  // TODO https://github.com/GoogleChromeLabs/squoosh/issues/1111
  const imagePool = new ImagePool(1);
  const image = imagePool.ingestImage(new Uint8Array(original.data));

  const { encodeOptions } = /** @type {SquooshMinimizerOptions} */ (
    minifyOptions || {}
  );

  try {
    await image.encode(encodeOptions);
  } catch (error) {
    await imagePool.close();

    original.errors.push(
      error instanceof Error ? error : new Error(/** @type {string} */ (error))
    );

    return original;
  }

  await imagePool.close();

  if (Object.keys(image.encodedWith).length === 0) {
    original.errors.push(
      new Error(
        "No result from 'squoosh', please configure the 'encodeOptions' option to generate images"
      )
    );

    return original;
  }

  const ext = path.extname(original.filename).toLowerCase();
  const { binary, extension } = await Object.values(image.encodedWith)[0];
  const newFilename = original.filename.replace(
    new RegExp(`${ext}$`),
    `.${extension}`
  );

  return {
    filename: newFilename,
    data: Buffer.from(binary),
    warnings: [...original.warnings],
    errors: [...original.errors],
    info: {
      ...original.info,
      generated: true,
      generatedBy:
        original.info && original.info.generatedBy
          ? ["squoosh", ...original.info.generatedBy]
          : ["squoosh"],
    },
  };
}

/**
 * @template T
 * @param {WorkerResult} original
 * @param {T} options
 * @returns {Promise<WorkerResult>}
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

  const { encodeOptions = {} } = /** @type {SquooshMinimizerOptions} */ (
    options || {}
  );

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

  const { binary } = await image.encodedWith[targets[ext]];

  return {
    filename: original.filename,
    data: Buffer.from(binary),
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

export {
  throttleAll,
  imageminNormalizeConfig,
  imageminMinify,
  imageminGenerate,
  squooshMinify,
  squooshGenerate,
};
