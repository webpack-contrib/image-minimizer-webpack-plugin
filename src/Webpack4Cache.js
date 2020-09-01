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

  async get(task, sources) {
    let weakOutput;

    if (!this.loader) {
      weakOutput = this.weakCache.get(task.source);

      if (weakOutput) {
        return weakOutput;
      }
    }

    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    // eslint-disable-next-line no-param-reassign
    task.cacheIdent = task.cacheIdent || serialize(task.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cache, task.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const result = Buffer.from(JSON.parse(cachedResult.data).data);

    if (this.loader) {
      return result;
    }

    return new sources.RawSource(result);
  }

  async store(task) {
    if (!this.loader) {
      if (!this.weakCache.has(task.source)) {
        this.weakCache.set(task.source, task.output);
      }
    }

    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const { cacheIdent } = task;
    let { output } = task;

    if (!this.loader) {
      output = output.source();
    }

    return cacache.put(this.cache, cacheIdent, JSON.stringify(output));
  }
}
