import path from 'path';

import fileType from 'file-type';

import { fixturesPath, isOptimized, webpack } from './helpers';

describe('loader filename option', () => {
  it('should transform image source to webp (default behavior)', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './loader-single.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      imageminPluginOptions: {
        keepOriginal: false,
        filename: '[path][name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const file = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.jpg'
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should emit new image.webp and keep original uncompressed image', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './loader-single.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      imageminPluginOptions: {
        keepOriginal: true,
        filename: '[path][name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const originalFile = {
      path: path.resolve(__dirname, 'outputs', './nested/deep/loader-test.jpg'),
    };

    originalFile.ext = await fileType.fromFile(originalFile.path);

    expect(/image\/jpeg/i.test(originalFile.ext.mime)).toBe(true);
    await expect(
      isOptimized('nested/deep/loader-test.jpg', compilation)
    ).resolves.toBe(false);

    const emittedFile = {
      path: path.resolve(
        __dirname,
        'outputs',
        './nested/deep/loader-test.webp'
      ),
    };

    emittedFile.ext = await fileType.fromFile(emittedFile.path);

    expect(/image\/webp/i.test(emittedFile.ext.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
