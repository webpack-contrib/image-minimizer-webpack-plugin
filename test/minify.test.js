import fs from 'fs';
import path from 'path';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminSvgo from 'imagemin-svgo';
import pify from 'pify';

import minify from '../src/minify';

function isPromise(obj) {
  return (
    Boolean(obj) &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

describe('minify', () => {
  it('minify should be is function', () =>
    expect(typeof minify === 'function').toBe(true));

  it('should return `Promise`', () =>
    expect(
      isPromise(
        minify([{ input: Buffer.from('Foo') }], {
          minimizerOptions: { plugins: ['mozjpeg'] },
        })
      )
    ).toBe(true));

  it('should optimize', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize (relative filename)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify(
      [{ input, filename: path.relative(process.cwd(), filename) }],
      {
        minimizerOptions: {
          plugins: ['mozjpeg'],
        },
      }
    );

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(path.relative(process.cwd(), filename));

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize multiple images', async () => {
    const firstFilename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const secondFilename = path.resolve(
      __dirname,
      './fixtures/loader-test.jpg'
    );
    const firstInput = await pify(fs.readFile)(firstFilename);
    const secondInput = await pify(fs.readFile)(secondFilename);
    const result = await minify(
      [
        { input: firstInput, filename: firstFilename },
        { input: secondInput, filename: secondFilename },
      ],
      {
        minimizerOptions: { plugins: ['mozjpeg'] },
      }
    );

    expect(result).toHaveLength(2);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[1].warnings).toHaveLength(0);
    expect(result[1].errors).toHaveLength(0);

    const optimizedFirstSource = await imagemin.buffer(firstInput, {
      plugins: [imageminMozjpeg()],
    });
    const optimizedSecondSource = await imagemin.buffer(firstInput, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedFirstSource)).toBe(true);
    expect(result[1].output.equals(optimizedSecondSource)).toBe(true);
  });

  it('should return optimized image even when optimized image large then original', async () => {
    const svgoOptions = {
      plugins: [
        {
          addAttributesToSVGElement: {
            attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
          },
        },
      ],
    };

    const filename = path.resolve(
      __dirname,
      './fixtures/large-after-optimization.svg'
    );
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: [['svgo', svgoOptions]] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should not throw error on empty', async () => {
    const result = await minify();

    expect(result).toHaveLength(0);
  });

  it('should throw error on empty', async () => {
    const result = await minify([{}]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect(result[0].errors[0].toString()).toMatch(/Empty input/);
    expect(result[0].filename).toBeUndefined();
    expect(result[0].input).toBeUndefined();
    expect(result[0].output).toBeUndefined();
  });

  it('should throw error on empty `imagemin` options', async () => {
    const input = Buffer.from('Foo');
    const filename = path.resolve('foo.png');
    const result = await minify([{ input, filename }]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);
  });

  it('should throw error on empty `imagemin.plugins` options', async () => {
    const input = Buffer.from('Foo');
    const filename = path.resolve('foo.png');
    const result = await minify([
      { input, filename, minimizerOptions: { plugins: [] } },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);
  });

  it('should throw error on invalid `imagemin.plugins` options', async () => {
    const input = Buffer.from('Foo');
    const filename = path.resolve('foo.png');
    const result = await minify([
      { input, filename, minimizerOptions: { plugins: false } },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);
  });

  it('should throw warning on broken image (no `bail` option)', async () => {
    const filename = path.resolve(__dirname, './fixtures/test-corrupted.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].errors).toHaveLength(0);
    expect([...result[0].warnings][0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(result[0].output.equals(input)).toBe(true);
  });

  it('should throw warning on broken image (`bail` option with `false` value)', async () => {
    const filename = path.resolve(__dirname, './fixtures/test-corrupted.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: false,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].errors).toHaveLength(0);
    expect([...result[0].warnings][0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(result[0].output.equals(input)).toBe(true);
  });

  it('should throw error on broken image (`bail` option with `true` value)', async () => {
    const filename = path.resolve(__dirname, './fixtures/test-corrupted.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: true,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect([...result[0].errors][0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(result[0].output.equals(input)).toBe(true);
  });

  it('should return original content on invalid content (`String`)', async () => {
    const input = 'Foo';
    const result = await minify([{ input, filename: 'foo.jpg' }], {
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.toString()).toBe(input);
  });

  it('should optimize and cache (`cache` option with `true` value)', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'imagemin-webpack' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(optimizedSource)).toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it('should optimize and cache (`cache` option with `true` value and with `string` and `array` configuration)', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'imagemin-webpack' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg']] },
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(optimizedSource)).toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it('should optimize and cache (`cache` option with `true` value and with same `array` configuration)', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'imagemin-webpack' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg']] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(optimizedSource)).toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it('should optimize and cache and invalidate cache with other `minimizerOptions`', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'imagemin-webpack' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', { quality: 0 }]] },
    });
    const secondOptimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg({ quality: 0 })],
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(secondOptimizedSource)).toBe(true);

    // Due invalidation of cache we try to get cache and put new cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(1);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it('should optimize and cache and invalidate cache with other version of `imagemin` plugin', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'imagemin-webpack' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);

    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    jest.doMock('imagemin-mozjpeg/package.json', () => ({
      name: 'imagemin-mozjpeg',
      version: '999999.99999.99999',
    }));

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });
    const secondOptimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(secondOptimizedSource)).toBe(true);

    // Due invalidation of cache we try to get cache and put new cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(1);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();

    jest.dontMock('imagemin-mozjpeg/package.json');
  });

  it('should optimize and cache and invalidate cache with other version of `imagemin`', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'imagemin-webpack' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);

    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    jest.doMock('imagemin/package.json', () => ({
      name: 'imagemin',
      version: '999999.99999.99999',
    }));

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });
    const secondOptimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(secondOptimizedSource)).toBe(true);

    // Due invalidation of cache we try to get cache and put new cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(1);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();

    jest.dontMock('imagemin-mozjpeg/package.json');
  });

  it('should optimize and cache and invalidate cache with other version of `imagemin-webpack`', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'imagemin-webpack' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);

    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    jest.doMock('image-minimizer-webpack-plugin/package.json', () => ({
      name: 'imagemin-webpack',
      version: '999999.99999.99999',
    }));

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: [['mozjpeg', {}]] },
    });
    const secondOptimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(secondOptimizedSource)).toBe(true);

    // Due invalidation of cache we try to get cache and put new cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(1);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();

    jest.dontMock('imagemin-mozjpeg/package.json');
  });

  it('should optimize and cache (`cache` option with `{String}` value)', async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const cacheDir = findCacheDir({ name: 'minify-cache' });

    await cacache.rm.all(cacheDir);

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondResult = await minify([{ input, filename }], {
      cache: cacheDir,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].warnings).toHaveLength(0);
    expect(secondResult[0].errors).toHaveLength(0);
    expect(secondResult[0].output.equals(optimizedSource)).toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimize and doesn't cache (`cache` option with `false` value)", async () => {
    const spyGet = jest.spyOn(cacache, 'get');
    const spyPut = jest.spyOn(cacache, 'put');

    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      cache: false,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(optimizedSource)).toBe(true);

    expect(spyGet).toHaveBeenCalledTimes(0);
    expect(spyPut).toHaveBeenCalledTimes(0);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it('should not optimize filtered', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: ['mozjpeg'] },
      filter: (source, sourcePath) => {
        expect(source).toBeInstanceOf(Buffer);
        expect(typeof sourcePath).toBe('string');

        if (source.byteLength === 631) {
          return false;
        }

        return true;
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.equals(input)).toBe(true);
    expect(result[0].filename).toBe(filename);
    expect(result[0].filtered).toBe(true);
  });

  it('should optimize (configuration using `function`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `string`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['mozjpeg', { quality: 0 }]],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg({ quality: 0 })],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array` without options)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['mozjpeg']],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `string` with full name)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['imagemin-mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array` with full name)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['imagemin-mozjpeg', { quality: 0 }]],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg({ quality: 0 })],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array` with full name and without options)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['imagemin-mozjpeg']],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should throw warning on empty `imagemin` options (configuration using `string`) (`bail` is not specify)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(path.resolve(filename));
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw error on empty `imagemin` options (configuration using `string`) (`bail` is `true`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: true,
      minimizerOptions: {
        plugins: ['unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect(result[0].errors[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw warning on empty `imagemin` options (configuration using `string`) (`bail` is `false`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: false,
      minimizerOptions: {
        plugins: ['unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw error on empty `imagemin` options (configuration using `string` and starting with `imagemin`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['imagemin-unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should optimize and throw error on unknown plugin (configuration using `string`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['imagemin-mozjpeg', 'unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should optimize and throw warning on using `Function` configuration', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [imageminMozjpeg()],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Do not use a function as plugin/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });

  it('should throw error on invalid plugin configuration (`bail` is `true`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: true,
      minimizerOptions: {
        plugins: [{ foo: 'bar' }],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect(result[0].errors[0].toString()).toMatch(
      /Invalid plugin configuration/
    );
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw warning on invalid plugin configuration (`bail` is `false`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: false,
      minimizerOptions: {
        plugins: [{ foo: 'bar' }],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Invalid plugin configuration/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should support svgo options', async () => {
    const svgoOptions = {
      plugins: [
        {
          cleanupIDs: {
            prefix: 'qwerty',
          },
        },
      ],
    };

    const filename = path.resolve(__dirname, './fixtures/svg-with-id.svg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: [['svgo', svgoOptions]] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result[0].output.equals(optimizedSource)).toBe(true);
  });
});
