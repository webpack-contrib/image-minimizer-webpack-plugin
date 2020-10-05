export default class Cache {
  // eslint-disable-next-line no-unused-vars
  constructor(compilation) {
    this.cache = compilation.getCache('ImageMinimizerWebpackPlugin');
  }

  async get(cacheData) {
    // eslint-disable-next-line no-param-reassign
    cacheData.eTag =
      cacheData.eTag || this.cache.getLazyHashedEtag(cacheData.source);

    return this.cache.getPromise(cacheData.name, cacheData.eTag);
  }

  async store(cacheData) {
    const { compressed, warnings } = cacheData;

    return this.cache.storePromise(cacheData.name, cacheData.eTag, {
      compressed,
      warnings,
    });
  }
}
