import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Webpack4Cache {
  constructor(compilation, options, weakCache, loader) {
    this.cache =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
    this.weakCache = weakCache;
    this.loader = loader;
  }

  static getCacheDirectory() {
    return (
      findCacheDir({ name: 'image-minimizer-webpack-plugin' }) || os.tmpdir()
    );
  }

  async get(cacheData, sources) {
    let weakOutput;

    if (!this.loader) {
      weakOutput = this.weakCache.get(cacheData.source);

      if (weakOutput) {
        return weakOutput;
      }
    }

    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    // eslint-disable-next-line no-param-reassign
    cacheData.cacheIdent =
      cacheData.cacheIdent || serialize(cacheData.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cache, cacheData.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const result = JSON.parse(cachedResult.data);

    result.output = Buffer.isBuffer(result.output)
      ? result.output
      : Buffer.from(result.output);

    if (this.loader) {
      return result;
    }

    result.output = new sources.RawSource(result.output);

    return result;
  }

  async store(cacheData) {
    if (!this.loader) {
      if (!this.weakCache.has(cacheData.source)) {
        this.weakCache.set(cacheData.source, cacheData);
      }
    }

    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const { cacheIdent } = cacheData;

    let output = cacheData.output;

    if (!this.loader) {
      output = cacheData.output.source();
    }

    return cacache.put(
      this.cache,
      cacheIdent,
      JSON.stringify({ ...cacheData, output })
    );
  }
}
