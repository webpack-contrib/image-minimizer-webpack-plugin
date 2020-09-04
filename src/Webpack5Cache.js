export default class Cache {
  // eslint-disable-next-line no-unused-vars
  constructor(compilation) {
    this.cache = compilation.getCache('ImageMinimizerWebpackPlugin');
  }

  async get(task) {
    // eslint-disable-next-line no-param-reassign
    task.eTag = task.eTag || this.cache.getLazyHashedEtag(task.source);

    return this.cache.getPromise(task.filename, task.eTag);
  }

  async store(task) {
    return this.cache.storePromise(task.filename, task.eTag, task);
  }
}
