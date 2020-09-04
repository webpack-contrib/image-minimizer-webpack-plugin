import path from 'path';

import crypto from 'crypto';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import webpack from 'webpack';

import minify from './minify';
import schema from './loader-options.json';

const isWebpack4 = () => {
  return webpack.version[0] === '4';
};

const { RawSource } =
  // eslint-disable-next-line global-require
  webpack.sources || require('webpack-sources');

module.exports = async function loader(content) {
  const options = loaderUtils.getOptions(this);

  validateOptions(schema, options, {
    name: 'Image Minimizer Plugin Loader',
    baseDataPath: 'options',
  });

  const callback = this.async();

  const { resourcePath } = this;
  const filename = path.relative(this.rootContext, resourcePath);

  if (options.filter && !options.filter(content, filename)) {
    callback(null, content);

    return;
  }

  const input = content;
  let cache;
  let cacheData;
  let output;

  if (isWebpack4()) {
    cacheData = { assetName: filename, input };

    // eslint-disable-next-line global-require
    const CacheEngine = require('./Webpack4Cache').default;

    cache = new CacheEngine(
      null,
      {
        cache: options.cache,
      },
      false,
      true
    );

    cacheData.cacheKeys = {
      nodeVersion: process.version,
      // eslint-disable-next-line global-require
      'image-minimizer-webpack-plugin': require('../package.json').version,
      'image-minimizer-webpack-plugin-options': options,
      assetName: filename,
      contentHash: crypto.createHash('md4').update(input).digest('hex'),
    };

    output = await cache.get(cacheData, { RawSource });
  }

  if (!output) {
    const { severityError, minimizerOptions } = options;

    const minifyOptions = {
      input,
      source: input,
      filename,
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

    if (isWebpack4()) {
      await cache.store({ ...output, ...cacheData });
    }
  }

  if (output.warnings && output.warnings.length > 0) {
    output.warnings.forEach((warning) => {
      this.emitWarning(warning);
    });
  }

  const data = output.compressed || output.input;

  callback(null, data);
};

module.exports.raw = true;
