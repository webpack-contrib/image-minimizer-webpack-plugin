import os from 'os';

import path from 'path';

import del from 'del';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';

import {
  isOptimized,
  plugins,
  webpack,
  compile,
  fixturesPath,
} from './helpers';

describe('cache option - persistent cache', () => {
  it('should work and cache (loader + plugin)', async () => {
    const cacheDir = findCacheDir({ name: 'image-minimizer-webpack-plugin' });

    await cacache.rm.all(cacheDir);

    const compiler = await webpack(
      {
        entry: path.join(fixturesPath, './simple.js'),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
          cache: true,
          minimizerOptions: { plugins },
        },
      },
      true
    );

    const stats = await compile(compiler);

    const { compilation } = stats;

    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    if (webpack.isWebpack4()) {
      expect(
        Object.keys(stats.compilation.assets).filter(
          (assetName) => stats.compilation.assets[assetName].emitted
        ).length
      ).toBe(3);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(3);
    }

    const secondStats = await compile(compiler);
    const {
      warnings: secondWarnings,
      errors: secondErrors,
    } = secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    if (webpack.isWebpack4()) {
      expect(
        Object.keys(secondStats.compilation.assets).filter(
          (assetName) => secondStats.compilation.assets[assetName].emitted
        ).length
      ).toBe(0);
    } else {
      expect(secondStats.compilation.emittedAssets.size).toBe(0);
    }
  });

  it('should work and do not cache when cache is "false"', async () => {
    const compiler = await webpack(
      {
        entry: path.join(fixturesPath, './simple.js'),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
          cache: false,
          minimizerOptions: { plugins },
        },
      },
      true
    );

    const stats = await compile(compiler);

    const { compilation } = stats;

    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    if (webpack.isWebpack4()) {
      expect(
        Object.keys(stats.compilation.assets).filter(
          (assetName) => stats.compilation.assets[assetName].emitted
        ).length
      ).toBe(3);
    } else {
      expect(stats.compilation.emittedAssets.size).toBe(3);
    }

    const secondStats = await compile(compiler);
    const {
      warnings: secondWarnings,
      errors: secondErrors,
    } = secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    if (webpack.isWebpack4()) {
      expect(
        Object.keys(secondStats.compilation.assets).filter(
          (assetName) => secondStats.compilation.assets[assetName].emitted
        ).length
      ).toBe(1);
    } else {
      expect(secondStats.compilation.emittedAssets.size).toBe(1);
    }
  });
});

if (webpack.isWebpack4()) {
  describe('cache option', () => {
    it('should optimizes all images and cache their (loader + plugin)', async () => {
      const spyGet = jest.spyOn(cacache, 'get');
      const spyPut = jest.spyOn(cacache, 'put');

      const cacheDir = findCacheDir({ name: 'image-minimizer-webpack-plugin' });

      await cacache.rm.all(cacheDir);

      const options = {
        emitPlugin: true,
        imageminPluginOptions: {
          cache: true,
          minimizerOptions: { plugins },
        },
      };
      const stats = await webpack(options);
      const { compilation } = stats;
      const { warnings, errors } = compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
        true
      );

      // // Try to found cached files, but we don't have their in cache
      expect(spyGet).toHaveBeenCalledTimes(5);
      // // Put files in cache
      expect(spyPut).toHaveBeenCalledTimes(5);

      spyGet.mockClear();
      spyPut.mockClear();

      const secondStats = await webpack(options);
      const { compilation: secondCompilation } = secondStats;
      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondStats.compilation;

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('plugin-test.jpg', secondCompilation)
      ).resolves.toBe(true);

      // Now we have cached files so we get their and don't put
      expect(spyGet).toHaveBeenCalledTimes(5);
      expect(spyPut).toHaveBeenCalledTimes(0);

      spyGet.mockRestore();
      spyPut.mockRestore();
    });

    it('should optimizes all images and cache their (custom cache location) (loader + plugin)', async () => {
      const spyGet = jest.spyOn(cacache, 'get');
      const spyPut = jest.spyOn(cacache, 'put');

      const cacheDir =
        findCacheDir({
          name: 'imagemin-webpack-plugin-cache-location-for-plugin',
        }) || os.tmpdir();

      await cacache.rm.all(cacheDir);

      const options = {
        emitPlugin: true,
        imageminPluginOptions: {
          cache: cacheDir,
          minimizerOptions: { plugins },
        },
      };
      const stats = await webpack(options);
      const { compilation } = stats;
      const { warnings, errors } = compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
        true
      );

      // Try to found cached files, but we don't have their in cache
      expect(spyGet).toHaveBeenCalledTimes(5);
      // Put files in cache
      expect(spyPut).toHaveBeenCalledTimes(5);

      spyGet.mockClear();
      spyPut.mockClear();

      const secondStats = await webpack(options);
      const { compilation: secondCompilation } = secondStats;
      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondStats.compilation;

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('plugin-test.jpg', secondCompilation)
      ).resolves.toBe(true);

      // Now we have cached files so we get their and don't put
      expect(spyGet).toHaveBeenCalledTimes(5);
      expect(spyPut).toHaveBeenCalledTimes(0);

      await cacache.rm.all(cacheDir);

      spyGet.mockRestore();
      spyPut.mockRestore();
    });

    it("should optimizes all images and doesn't cache their (loader + plugin)", async () => {
      const spyGet = jest.spyOn(cacache, 'get');
      const spyPut = jest.spyOn(cacache, 'put');

      const stats = await webpack({
        emitPlugin: true,
        imageminPluginOptions: {
          cache: false,
          minimizerOptions: { plugins },
        },
      });

      const { compilation } = stats;
      const { warnings, errors } = compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
        true
      );

      expect(spyGet).toHaveBeenCalledTimes(0);
      expect(spyPut).toHaveBeenCalledTimes(0);

      spyGet.mockRestore();
      spyPut.mockRestore();
    });

    it('should optimizes all images and cache their', async () => {
      const spyGet = jest.spyOn(cacache, 'get');
      const spyPut = jest.spyOn(cacache, 'put');

      const cacheDir =
        findCacheDir({ name: 'image-minimizer-webpack-plugin' }) || os.tmpdir();

      await cacache.rm.all(cacheDir);

      const options = {
        imageminLoaderOptions: { cache: true, minimizerOptions: { plugins } },
      };
      const stats = await webpack(options);
      const { compilation } = stats;
      const { warnings, errors } = compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );

      // Try to found cached files, but we don't have their in cache
      expect(spyGet).toHaveBeenCalledTimes(4);
      // Put files in cache
      expect(spyPut).toHaveBeenCalledTimes(4);

      spyGet.mockClear();
      spyPut.mockClear();

      const secondStats = await webpack(options);
      const { compilation: secondCompilation } = secondStats;
      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);

      // Now we have cached files so we get their and don't put
      expect(spyGet).toHaveBeenCalledTimes(4);
      expect(spyPut).toHaveBeenCalledTimes(0);

      await cacache.rm.all(cacheDir);

      spyGet.mockRestore();
      spyPut.mockRestore();
    });

    it('should optimizes all images and cache their (custom cache location)', async () => {
      const spyGet = jest.spyOn(cacache, 'get');
      const spyPut = jest.spyOn(cacache, 'put');

      const cacheDir =
        findCacheDir({
          name: 'imagemin-webpack-loader-custom-cache-location-for-loader',
        }) || os.tmpdir();

      await cacache.rm.all(cacheDir);

      const options = {
        imageminLoaderOptions: {
          cache: cacheDir,
          minimizerOptions: { plugins },
        },
      };
      const stats = await webpack(options);
      const { compilation } = stats;
      const { warnings, errors } = compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );

      // Try to found cached files, but we don't have their in cache
      expect(spyGet).toHaveBeenCalledTimes(4);
      // Put files in cache
      expect(spyPut).toHaveBeenCalledTimes(4);

      spyGet.mockClear();
      spyPut.mockClear();

      const secondStats = await webpack(options);
      const { compilation: secondCompilation } = secondStats;
      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);

      // Now we have cached files so we get their and don't put
      expect(spyGet).toHaveBeenCalledTimes(4);
      expect(spyPut).toHaveBeenCalledTimes(0);

      await cacache.rm.all(cacheDir);

      spyGet.mockRestore();
      spyPut.mockRestore();
    });

    it("should optimizes all images and doesn't cache their", async () => {
      const spyGet = jest.spyOn(cacache, 'get');
      const spyPut = jest.spyOn(cacache, 'put');

      const stats = await webpack({
        imageminLoaderOptions: { cache: false, minimizerOptions: { plugins } },
      });
      const { compilation } = stats;
      const { warnings, errors } = compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );

      expect(spyGet).toHaveBeenCalledTimes(0);
      expect(spyPut).toHaveBeenCalledTimes(0);

      spyGet.mockRestore();
      spyPut.mockRestore();
    });

    it('should not add to cache broken images (plugin)', async () => {
      const spyGet = jest.spyOn(cacache, 'get');
      const spyPut = jest.spyOn(cacache, 'put');

      const cacheDir = findCacheDir({ name: 'image-minimizer-webpack-plugin' });

      await cacache.rm.all(cacheDir);

      const options = {
        emitPluginOptions: {
          fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
        },
        entry: path.join(fixturesPath, 'empty-entry.js'),
        imageminPluginOptions: {
          cache: true,
          severityError: true,
          minimizerOptions: {
            plugins,
          },
        },
      };
      const stats = await webpack(options);
      const { compilation } = stats;
      const { warnings, errors } = compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /(Corrupt JPEG data|Command failed with EPIPE)/
      );

      await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
        true
      );

      // Try to found cached files, but we don't have their in cache
      expect(spyGet).toHaveBeenCalledTimes(2);
      // Put files in cache
      expect(spyPut).toHaveBeenCalledTimes(1);

      spyGet.mockClear();
      spyPut.mockClear();

      const secondStats = await webpack(options);
      const { compilation: secondCompilation } = secondStats;
      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(1);
      expect(secondErrors[0].message).toMatch(
        /(Corrupt JPEG data|Command failed with EPIPE)/
      );

      await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
        true
      );

      // Now we have cached files so we get their and don't put
      expect(spyGet).toHaveBeenCalledTimes(2);
      expect(spyPut).toHaveBeenCalledTimes(0);

      await cacache.rm.all(cacheDir);

      spyGet.mockRestore();
      spyPut.mockRestore();
    });
  });
} else {
  describe('cache option', () => {
    const fileSystemCacheDirectory = path.resolve(
      __dirname,
      './outputs/type-filesystem'
    );

    beforeAll(() => {
      return Promise.all([del(fileSystemCacheDirectory)]);
    });

    function isImageLoader(identifier) {
      const query = identifier.split('!');

      if (query.length < 2) {
        return false;
      }

      const isModules = /^Compilation\/modules/i.test(query.shift());
      const isTargetFile = /loader-test\.(svg|png|jpg|gif)$/i.test(query.pop());

      return isModules && isTargetFile;
    }

    it('should optimizes all images and cache their (plugin)', async () => {
      const compiler = await webpack(
        {
          cache: {
            type: 'filesystem',
            cacheDirectory: fileSystemCacheDirectory,
          },
          emitPlugin: true,
          imageminPluginOptions: {
            loader: false,
            cache: true,
            minimizerOptions: { plugins },
          },
        },
        true
      );

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      const { compilation } = stats;

      const { warnings, errors } = compilation;

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(5);

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
        true
      );

      getCounter = 0;
      storeCounter = 0;

      const secondStats = await compile(compiler);

      const { compilation: secondCompilation } = secondStats;

      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(0);

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('plugin-test.jpg', secondCompilation)
      ).resolves.toBe(true);
    });

    it('should optimizes all images and cache their (loader)', async () => {
      const compiler = await webpack(
        {
          cache: {
            type: 'filesystem',
            cacheDirectory: fileSystemCacheDirectory,
          },
          imageminPluginOptions: {
            cache: true,
            minimizerOptions: { plugins },
          },
        },
        true
      );

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (isImageLoader(identifier)) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (isImageLoader(identifier)) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      const { compilation } = stats;

      const { warnings, errors } = compilation;

      // Get cache for assets
      expect(getCounter).toBe(4);
      // Store cached assets
      expect(storeCounter).toBe(4);

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );

      getCounter = 0;
      storeCounter = 0;

      const secondStats = await compile(compiler);

      const { compilation: secondCompilation } = secondStats;

      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      // Get cache for assets
      expect(getCounter).toBe(4);
      // Store cached assets
      expect(storeCounter).toBe(0);

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);
    });

    it('should optimizes all images and cache their (plugin + loader)', async () => {
      const compiler = await webpack(
        {
          cache: {
            type: 'memory',
          },
          emitPlugin: true,
          imageminPluginOptions: {
            cache: true,
            minimizerOptions: { plugins },
          },
        },
        true
      );

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (
            isImageLoader(identifier) ||
            identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1
          ) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (
            isImageLoader(identifier) ||
            identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1
          ) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      const { compilation } = stats;

      const { warnings, errors } = compilation;

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(5);

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
        true
      );

      getCounter = 0;
      storeCounter = 0;

      const secondStats = await compile(compiler);

      const { compilation: secondCompilation } = secondStats;

      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(0);

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('plugin-test.jpg', secondCompilation)
      ).resolves.toBe(true);
    });

    it('should optimizes all images and cache false (plugin + loader)', async () => {
      const compiler = await webpack(
        {
          cache: false,
          emitPlugin: true,
          imageminPluginOptions: {
            cache: false,
            minimizerOptions: { plugins },
          },
        },
        true
      );

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (
            isImageLoader(identifier) ||
            identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1
          ) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (
            isImageLoader(identifier) ||
            identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1
          ) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      const { compilation } = stats;

      const { warnings, errors } = compilation;

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(5);

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
        true
      );
      await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
        true
      );

      getCounter = 0;
      storeCounter = 0;

      const secondStats = await compile(compiler);

      const { compilation: secondCompilation } = secondStats;

      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      // Get cache for assets
      expect(getCounter).toBe(5);
      // Store cached assets
      expect(storeCounter).toBe(5);

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(0);

      await expect(
        isOptimized('loader-test.gif', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.jpg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.png', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('loader-test.svg', secondCompilation)
      ).resolves.toBe(true);
      await expect(
        isOptimized('plugin-test.jpg', secondCompilation)
      ).resolves.toBe(true);
    });

    it('should not add to cache broken images (plugin)', async () => {
      const compiler = await webpack(
        {
          emitPluginOptions: {
            fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
          },
          entry: path.join(fixturesPath, 'empty-entry.js'),
          imageminPluginOptions: {
            cache: true,
            severityError: true,
            minimizerOptions: { plugins },
          },
        },
        true
      );

      let getCounter = 0;

      compiler.cache.hooks.get.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (
            isImageLoader(identifier) ||
            identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1
          ) {
            getCounter += 1;
          }
        }
      );

      let storeCounter = 0;

      compiler.cache.hooks.store.tap(
        { name: 'TestCache', stage: -100 },
        (identifier) => {
          if (
            isImageLoader(identifier) ||
            identifier.indexOf('ImageMinimizerWebpackPlugin') !== -1
          ) {
            storeCounter += 1;
          }
        }
      );

      const stats = await compile(compiler);

      const { compilation } = stats;

      const { warnings, errors } = compilation;

      // Get cache for assets
      expect(getCounter).toBe(2);
      // Store cached assets
      expect(storeCounter).toBe(1);

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /(Corrupt JPEG data|Command failed with EPIPE)/
      );

      await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
        true
      );

      getCounter = 0;
      storeCounter = 0;

      const secondStats = await compile(compiler);

      const { compilation: secondCompilation } = secondStats;

      const {
        warnings: secondWarnings,
        errors: secondErrors,
      } = secondCompilation;

      // Get cache for assets
      expect(getCounter).toBe(2);
      // Store cached assets
      expect(storeCounter).toBe(0);

      expect(secondWarnings).toHaveLength(0);
      expect(secondErrors).toHaveLength(1);
      expect(secondErrors[0].message).toMatch(
        /(Corrupt JPEG data|Command failed with EPIPE)/
      );

      await expect(
        isOptimized('plugin-test.png', secondCompilation)
      ).resolves.toBe(true);
    });
  });
}
