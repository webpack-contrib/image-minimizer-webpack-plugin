import fs from 'fs';
import path from 'path';

import pify from 'pify';

import { fixturesPath, isOptimized, plugins, webpack } from './helpers';

describe('loader', () => {
  it('should optimizes all images', async () => {
    const stats = await webpack({ imageminLoader: true });
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
  });

  it("should optimizes all images and don't break non images", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-other-imports.js'),
      imageminLoader: true,
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(7);

    const { path: outputPath } = compilation.options.output;

    const txtBuffer = await pify(fs.readFile)(
      path.join(outputPath, 'loader-test.txt')
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, '\n')).toBe('TEXT\n');

    const cssBuffer = await pify(fs.readFile)(
      path.join(outputPath, 'loader-test.css')
    );

    expect(cssBuffer.toString().replace(/\r\n|\r/g, '\n')).toBe(
      'a {\n  color: red;\n}\n'
    );

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
  });

  it('should throws error on corrupted images using `severityError` option with `true` value', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: {
        severityError: true,
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws error on corrupted images using `severityError` option with `error` value', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: {
        severityError: 'error',
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws error on corrupted images using `severityError` option with `warning` value', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: {
        severityError: 'warning',
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws error on corrupted images using `severityError` option with `off` value', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: {
        severityError: 'off',
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws error on corrupted images using `severityError` option with `false` value', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: {
        severityError: false,
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws error on corrupted images using `severityError` option with `auto` value', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: {
        severityError: 'auto',
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws error on corrupted images using mode `production` and `severityError` option with `auto` value', async () => {
    const stats = await webpack({
      mode: 'production',
      optimization: {
        noEmitOnErrors: false,
      },
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: {
        severityError: 'auto',
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws error on corrupted images using mode `production` and `severityError` option not specify value', async () => {
    const stats = await webpack({
      mode: 'production',
      optimization: {
        noEmitOnErrors: false,
      },
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminLoaderOptions: { minimizerOptions: { plugins } },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes all images exclude filtered', async () => {
    const stats = await webpack({
      imageminLoaderOptions: {
        filter: (source, filename) => {
          expect(source).toBeInstanceOf(Buffer);
          expect(typeof filename).toBe('string');

          if (source.byteLength === 631) {
            return false;
          }

          return true;
        },
        minimizerOptions: { plugins },
      },
    });

    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(5);

    await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
      false
    );
  });
});
