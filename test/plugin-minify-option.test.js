import path from 'path';

import ImageMinimizerPlugin from '../src';

import { fixturesPath, webpack, isOptimized } from './helpers';

describe('plugin minify option', () => {
  it('should work with "imagemin" minifier', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './empty-entry.js'),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminMinify,
        minimizerOptions: {
          plugins: ['gifsicle', 'mozjpeg', 'pngquant', 'svgo'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work when minify is custom function', async () => {
    expect.assertions(6);

    const stats = await webpack({
      entry: path.join(fixturesPath, './empty-entry.js'),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: (input, minifiOptions, metaData) => {
          expect(input).toBeDefined();
          expect(minifiOptions).toBeDefined();
          expect(metaData).toBeDefined();

          return input;
        },
        minimizerOptions: {
          plugins: ['gifsicle', 'mozjpeg', 'pngquant', 'svgo'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      false
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work if minify is array && minimizerOptions is object', async () => {
    expect.assertions(6);

    const stats = await webpack({
      entry: path.join(fixturesPath, './empty-entry.js'),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (input, minifiOptions, metaData) => {
            expect(input).toBeDefined();
            expect(minifiOptions).toBeDefined();
            expect(metaData).toBeDefined();

            return input;
          },
        ],
        minimizerOptions: {
          plugins: ['gifsicle', 'mozjpeg', 'pngquant', 'svgo'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work if minify is array && minimizerOptions is array', async () => {
    expect.assertions(5);

    const stats = await webpack({
      entry: path.join(fixturesPath, './empty-entry.js'),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (input, minifiOptions) => {
            expect('options2' in minifiOptions).toBe(true);

            return input;
          },
          (input, minifiOptions) => {
            expect('options3' in minifiOptions).toBe(true);

            return input;
          },
        ],
        minimizerOptions: [
          {
            plugins: ['gifsicle', 'mozjpeg', 'pngquant', 'svgo'],
          },
          {
            options2: 'passed',
          },
          {
            options3: 'passed',
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
