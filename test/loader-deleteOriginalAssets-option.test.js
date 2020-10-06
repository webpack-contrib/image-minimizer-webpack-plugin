import path from 'path';

import fileType from 'file-type';
import findCacheDir from 'find-cache-dir';
import cacache from 'cacache';

import { fixturesPath, webpack } from './helpers';

describe('loader "deleteOriginalAssets" option', () => {
  beforeEach(async () => {
    const cacheDir = findCacheDir({ name: 'image-minimizer-webpack-plugin' });
    await cacache.rm.all(cacheDir);
  });

  it('should transform asset and keep original asset (default behavior)', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './loader-single.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      imageminPluginOptions: {
        filename: '[path][name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const originalAsset = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.jpg'
    );
    const transformedAsset = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.webp'
    );
    const originalExt = await fileType.fromFile(originalAsset);
    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/jpeg/i.test(originalExt.mime)).toBe(true);
    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should transform asset and keep original asset when the "deleteOriginalAssets" option is "false"', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './loader-single.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      imageminPluginOptions: {
        deleteOriginalAssets: false,
        filename: '[path][name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const originalAsset = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.jpg'
    );
    const transformedAsset = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.webp'
    );
    const originalExt = await fileType.fromFile(originalAsset);
    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/jpeg/i.test(originalExt.mime)).toBe(true);
    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it.skip('should transform asset and keep original asset when the "deleteOriginalAssets" option is "true"', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './loader-single.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      imageminPluginOptions: {
        deleteOriginalAssets: true,
        filename: '[path][name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const originalAsset = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.webp'
    );
    const transformedAsset = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.webp'
    );
    const originalExt = await fileType.fromFile(originalAsset);
    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/jpeg/i.test(originalExt.mime)).toBe(true);
    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
