export default class Cache {
  // eslint-disable-next-line no-unused-vars
  constructor(compilation) {
    this.cache = compilation.getCache('ImageMinimizerWebpackPlugin');
  }

  async get(cacheData) {
    // eslint-disable-next-line no-param-reassign
    cacheData.eTag =
      cacheData.eTag || this.cache.getLazyHashedEtag(cacheData.source);

    return this.cache.getPromise(cacheData.filename, cacheData.eTag);
  }

  async store(cacheData) {
    const { filename, compressed, warnings } = cacheData;

    return this.cache.storePromise(cacheData.filename, cacheData.eTag, {
      filename,
      compressed,
      warnings,
    });
  }
}
