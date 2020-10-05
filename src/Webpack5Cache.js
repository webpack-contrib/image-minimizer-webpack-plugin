export default class Cache {
  constructor(compilation) {
    this.cache = compilation.getCache('ImageMinimizerWebpackPlugin');
  }

  async get(cacheData) {
    // eslint-disable-next-line no-param-reassign
    cacheData.eTag =
      cacheData.eTag || this.cache.getLazyHashedEtag(cacheData.inputSource);

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
