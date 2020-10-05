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
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const weakOutput = this.loader
      ? // eslint-disable-next-line no-undefined
        undefined
      : this.weakCache.get(cacheData.inputSource);

    if (weakOutput) {
      return weakOutput;
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

    result.compressed = Buffer.from(result.compressed);

    if (this.loader) {
      return result;
    }

    result.compressed = new sources.RawSource(result.compressed);

    return result;
  }

  async store(cacheData) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    if (!this.loader && !this.weakCache.has(cacheData.inputSource)) {
      this.weakCache.set(cacheData.inputSource, cacheData);
    }

    let { compressed } = cacheData;

    if (!this.loader) {
      compressed = cacheData.compressed.source();
    }

    const { cacheIdent, warnings } = cacheData;

    return cacache.put(
      this.cache,
      cacheIdent,
      JSON.stringify({ compressed, warnings, cacheIdent })
    );
  }
}
