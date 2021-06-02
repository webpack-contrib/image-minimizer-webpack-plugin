import path from "path";

// Todo remove import/no-unresolved comment when "main" section in @squoosh/lib package.json will be fixed
/* istanbul ignore next */
async function squooshMinify(data, minifyOptions) {
  const [[filename, input]] = Object.entries(data);
  const result = {
    data: input,
    warnings: [],
    errors: [],
  };
  const targets = {
    ".png": "oxipng",
    ".jpg": "mozjpeg",
    ".jpeg": "mozjpeg",
    ".jxl": "jxl",
    ".webp": "webp",
    ".avif": "avif",
    ...minifyOptions.targets,
  };
  const ext = path.extname(filename).toLowerCase();

  if (!targets[ext]) {
    result.warnings.push(
      new Error(
        `The "${filename}" was not minified by "ImageMinimizerPlugin.squooshMinify". ${ext} extension is not supported".`
      )
    );

    return result;
  }

  const encodeOptions = {
    [targets[ext]]: {},
    ...minifyOptions.encodeOptions,
  };

  // Todo remove import/no-unresolved comment when "main" section in @squoosh/lib package.json will be fixed
  // eslint-disable-next-line node/no-unpublished-require,import/no-unresolved
  const squoosh = require("@squoosh/lib");
  const { ImagePool } = squoosh;
  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(input);

  try {
    await image.encode(encodeOptions);
  } catch (error) {
    await imagePool.close();

    result.errors.push(error);

    return result;
  }

  await imagePool.close();

  const encodedImage = await image.encodedWith[targets[ext]];

  result.data = Buffer.from(encodedImage.binary);

  return result;
}

export default squooshMinify;
