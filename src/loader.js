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

module.exports = async function loader(content) {
  const options = loaderUtils.getOptions(this);

  validateOptions(schema, options, {
    name: 'Image Minimizer Plugin Loader',
    baseDataPath: 'options',
  });

  const callback = this.async();

  const { resourcePath } = this;

  const task = {
    input: content,
    filename: path.relative(this.rootContext, resourcePath),
  };

  let cache;

  if (isWebpack4()) {
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

    task.cacheKeys = {
      nodeVersion: process.version,
      // eslint-disable-next-line global-require
      'image-minimizer-webpack-plugin': require('../package.json').version,
      'image-minimizer-webpack-plugin-options': options,
      assetName: task.filename,
      contentHash: crypto.createHash('md4').update(task.input).digest('hex'),
    };
  }

  let result;

  try {
    [result] = await minify(
      [task],
      {
        isProductionMode: this.mode === 'production' || !this.mode,
        severityError: options.severityError,
        loader: true,
        cache: options.cache,
        minimizerOptions: options.minimizerOptions,
        filter: options.filter,
      },
      cache
    );
  } catch (error) {
    callback(error);

    return;
  }

  if (result.warnings && result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      this.emitWarning(warning);
    });
  }

  if (result.errors && result.errors.length > 0) {
    result.errors.forEach((warning) => {
      this.emitError(warning);
    });
  }

  const data = result.output ? result.output : result.input;

  callback(null, data);
};

module.exports.raw = true;
