import path from "path";

import minify from "./minify";
import interpolateName from "./utils/interpolate-name";
import schema from "./loader-options.json";
import imageminMinify from "./utils/imageminMinify";

module.exports = async function loader(content) {
  const options = this.getOptions(schema);
  const callback = this.async();
  const name = path.relative(this.rootContext, this.resourcePath);

  if (options.filter && !options.filter(content, name)) {
    callback(null, content);

    return;
  }

  const input = content;

  const { severityError, minimizerOptions } = options;

  const minifyOptions = {
    minify: options.minify || imageminMinify,
    input,
    filename: name,
    severityError,
    minimizerOptions,
    isProductionMode: this.mode === "production" || !this.mode,
  };

  const output = await minify(minifyOptions);

  if (output.errors && output.errors.length > 0) {
    output.errors.forEach((warning) => {
      this.emitError(warning);
    });

    callback(null, content);

    return;
  }

  output.source = output.data;

  if (output.warnings && output.warnings.length > 0) {
    output.warnings.forEach((warning) => {
      this.emitWarning(warning);
    });
  }

  const { source } = output;
  const newName = interpolateName(
    name,
    options.filename || "[path][name][ext]"
  );
  const isNewAsset = name !== newName;

  if (isNewAsset) {
    this.emitFile(newName, source, null, {
      minimized: true,
    });

    if (options.deleteOriginalAssets) {
      // TODO remove original asset
    }

    callback(null, content);

    return;
  }

  callback(null, source);
};

module.exports.raw = true;
