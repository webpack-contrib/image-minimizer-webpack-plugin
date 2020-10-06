import path from 'path';

import crypto from 'crypto';

import loaderUtils from 'loader-utils';
import { validate } from 'schema-utils';

import webpack from 'webpack';

import minify from './minify';
import interpolateName from './utils/interpolate-name';
import schema from './loader-options.json';

const isWebpack4 = () => {
  return webpack.version[0] === '4';
};

module.exports = async function loader(content) {
  const options = loaderUtils.getOptions(this);

  validate(schema, options, {
    name: 'Image Minimizer Plugin Loader',
    baseDataPath: 'options',
  });

  const callback = this.async();

  const name = path.relative(this.rootContext, this.resourcePath);

  if (options.filter && !options.filter(content, name)) {
    callback(null, content);

    return;
  }

  const input = content;

  let cache;
  const cacheData = {};

  let output;

  if (isWebpack4()) {
    // eslint-disable-next-line global-require
    const CacheEngine = require('./Webpack4Cache').default;

    cache = new CacheEngine(null, { cache: options.cache }, false, true);

    cacheData.cacheKeys = {
      // eslint-disable-next-line global-require
      'image-minimizer-webpack-plugin': require('../package.json').version,
      'image-minimizer-webpack-plugin-options': options,
      name,
      contentHash: crypto.createHash('md4').update(input).digest('hex'),
    };

    output = await cache.get(cacheData);
  }

  if (!output) {
    const { severityError, minimizerOptions } = options;

    const minifyOptions = {
      input,
      filename: name,
      severityError,
      minimizerOptions,
      isProductionMode: this.mode === 'production' || !this.mode,
    };

    output = await minify(minifyOptions);

    if (output.errors && output.errors.length > 0) {
      output.errors.forEach((warning) => {
        this.emitError(warning);
      });

      callback(null, content);

      return;
    }

    output.source = output.output;

    if (isWebpack4()) {
      await cache.store({ ...output, ...cacheData });
    }
  }

  if (output.warnings && output.warnings.length > 0) {
    output.warnings.forEach((warning) => {
      this.emitWarning(warning);
    });
  }

  const { source } = output;
  const newName = interpolateName(
    name,
    options.filename || '[path][name][ext]'
  );
  const isNewAsset = name !== newName;

  if (isNewAsset) {
    if (options.deleteOriginalAssets) {
      callback(null, source);
    } else {
      this.emitFile(newName, source, null, {
        minimized: true,
      });

      callback(null, content);
    }

    return;
  }

  callback(null, source);
};

module.exports.raw = true;
