import path from 'path';

import {
  fixturesPath,
  isOptimized,
  hasLoader,
  plugins,
  webpack,
} from './helpers';

const IS_WEBPACK_VERSION_NEXT = process.env.WEBPACK_VERSION === 'next';

describe('imagemin plugin', () => {
  it('should optimizes all images (loader + plugin)', async () => {
    const stats = await webpack({ emitPlugin: true, imageminPlugin: true });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.jpg', modules)).toBe(true);
    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.svg', modules)).toBe(true);

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
  });

  it('should optimizes all images (loader + plugin) as minimizer', async () => {
    const stats = await webpack({
      asMinimizer: true,
      emitPlugin: true,
      imageminPlugin: true,
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.jpg', modules)).toBe(true);
    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.svg', modules)).toBe(true);

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
  });

  it('should optimizes all images (loader + plugin) (multi compiler mode)', async () => {
    const multiStats = await webpack([
      {
        entry: path.join(fixturesPath, 'multiple-entry.js'),
        emitPluginOptions: {
          fileNames: ['multiple-plugin-test-1.svg'],
        },
        imageminPlugin: true,
      },
      {
        entry: path.join(fixturesPath, 'multiple-entry-2.js'),
        emitPluginOptions: {
          fileNames: ['multiple-plugin-test-2.svg'],
        },
        imageminPlugin: true,
      },
    ]);

    expect(multiStats.stats).toHaveLength(2);

    const [{ compilation: firstCompilation }] = multiStats.stats;
    const { warnings, errors, modules } = multiStats.stats[0].compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('multiple-loader-test-1.svg', modules)).toBe(true);
    expect(hasLoader('multiple-loader-test-2.svg', modules)).toBe(true);

    await expect(
      isOptimized('multiple-loader-test-1.svg', firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-loader-test-2.svg', firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-plugin-test-1.svg', firstCompilation)
    ).resolves.toBe(true);

    const [, { compilation: secondCompilation }] = multiStats.stats;
    const {
      warnings: secondWarnings,
      errors: secondErrors,
      modules: secondModules,
    } = multiStats.stats[1].compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(hasLoader('multiple-loader-test-3.svg', secondModules)).toBe(true);
    expect(hasLoader('multiple-loader-test-4.svg', secondModules)).toBe(true);

    await expect(
      isOptimized('multiple-loader-test-3.svg', secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-loader-test-4.svg', secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-plugin-test-2.svg', secondCompilation)
    ).resolves.toBe(true);
  });

  it('should optimizes all images (plugin standalone)', async () => {
    const stats = await webpack({
      emitPlugin: true,
      imageminPluginOptions: {
        minimizerOptions: { plugins },
        loader: false,
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
  });

  it('should optimizes successfully without any assets', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPlugin: true,
    });

    const { warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should throws warnings if imagemin plugins don't setup (by plugin)", async () => {
    const stats = await webpack({
      emitPlugin: true,
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        minimizerOptions: {
          plugins: [],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].toString()).toMatch(/No plugins found for `imagemin`/);

    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      false
    );
  });

  it("should throws warnings if imagemin plugins don't setup (by loader)", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'single-image-loader.js'),
      imageminPluginOptions: {
        minimizerOptions: {
          plugins: [],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);

    expect(warnings[0].toString()).toMatch(/No plugins found for `imagemin`/);

    await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
      false
    );
  });

  it('should optimizes images and throws error on corrupted images using `plugin.severityError` option with `true` value (by plugin)', async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        severityError: true,
        minimizerOptions: {
          plugins,
        },
      },
    });
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
  });

  it('should optimizes images and throws error on corrupted images using `plugin.severityError` option with `error` value (by plugin)', async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        severityError: 'error',
        minimizerOptions: {
          plugins,
        },
      },
    });
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
  });

  it('should optimizes images and not throws error or warnings on corrupted images using `plugin.severityError` option with `off` value (by plugin)', async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        severityError: 'off',
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and not throws error or warnings on corrupted images using `plugin.severityError` option with false value (by plugin)', async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        severityError: false,
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and throws warnings on corrupted images using `plugin.severityError` option with `warning` value (by plugin)', async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        severityError: 'warning',
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and throws error on corrupted images using mode `development` and `plugin.severityError` option with `auto` value (by plugin)', async () => {
    const stats = await webpack({
      mode: 'development',
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        severityError: 'auto',
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and throws error on corrupted images when `plugin.severityError` option not specify (by plugin)', async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and throws error on corrupted images using mode `production` and `plugin.severityError` option with `auto` value (by plugin)', async () => {
    const stats = await webpack({
      mode: 'production',
      emitPluginOptions: {
        fileNames: ['test-corrupted.jpg', 'plugin-test.png'],
      },
      entry: path.join(fixturesPath, 'empty-entry.js'),
      imageminPluginOptions: {
        severityError: 'auto',
        minimizerOptions: {
          plugins,
        },
      },
    });
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
  });

  it('should optimizes images and throws errors on corrupted images using `plugin.severityError` option with `true` value (by loader)', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminPluginOptions: {
        severityError: true,
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and throws errors on corrupted images using `plugin.severityError` option with `error` value (by loader)', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminPluginOptions: {
        severityError: 'error',
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws errors on corrupted images using mode `development` and `plugin.severityError` option with `auto` value (by loader)', async () => {
    const stats = await webpack({
      mode: 'development',
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminPluginOptions: {
        severityError: 'auto',
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws errors on corrupted images when `plugin.severityError` option not specify (by loader)', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminPluginOptions: {
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should throws errors on corrupted images using mode `production` and `plugin.severityError` option with `auto` value (by loader)', async () => {
    const stats = await webpack({
      mode: 'production',
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminPluginOptions: {
        severityError: 'auto',
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and throws errors on corrupted images using `plugin.severityError` option with `off` value (by loader)', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminPluginOptions: {
        severityError: 'off',
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes images and throws errors on corrupted images using `plugin.severityError` option with `false` value (by loader)', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, 'loader-corrupted.js'),
      imageminPluginOptions: {
        severityError: false,
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes all images (loader + plugin) and interpolate `[name].[ext]` name', async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ['plugin-test.png'],
      },
      imageminPluginOptions: {
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.jpg', modules)).toBe(true);
    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.svg', modules)).toBe(true);

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
    await expect(isOptimized('plugin-test.png', compilation)).resolves.toBe(
      true
    );
  });

  it('should optimizes all images (loader + plugin) and interpolate `[path][name].[ext]` name', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './nested/deep/loader.js'),
      emitPluginOptions: {
        fileNames: ['nested/deep/plugin-test.png'],
      },
      imageminPluginOptions: {
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.jpg', modules)).toBe(true);
    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.svg', modules)).toBe(true);

    await expect(
      isOptimized('nested/deep/loader-test.gif', compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('nested/deep/loader-test.jpg', compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('nested/deep/loader-test.png', compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('nested/deep/loader-test.svg', compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('nested/deep/plugin-test.png', compilation)
    ).resolves.toBe(true);
  });

  it('should optimizes all images (loader + plugin) exclude filtered', async () => {
    const stats = await webpack({
      emitPlugin: true,
      imageminPluginOptions: {
        filter: (source, sourcePath) => {
          expect(source).toBeInstanceOf(Buffer);
          expect(typeof sourcePath).toBe('string');

          if (
            sourcePath.endsWith('loader-test.jpg') ||
            sourcePath.endsWith('plugin-test.jpg')
          ) {
            return false;
          }

          return true;
        },
        minimizerOptions: {
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.jpg', modules)).toBe(true);
    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.svg', modules)).toBe(true);

    await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
      false
    );
    await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      false
    );
  });

  it('should optimizes all images with filter (multiple plugins)', async () => {
    let firstFilterCounter = 0;
    let secondFilterCounter = 0;

    const stats = await webpack({
      entry: path.join(fixturesPath, 'multiple-entry.js'),
      emitPluginOptions: {
        fileNames: ['multiple-plugin-test-1.svg', 'multiple-plugin-test-2.svg'],
      },
      imageminPluginOptions: [
        {
          filter: (source) => {
            if (source.byteLength > 500) {
              firstFilterCounter += 1;

              return true;
            }

            return false;
          },
          minimizerOptions: {
            plugins,
          },
        },
        {
          filter: (source) => {
            if (source.byteLength < 500) {
              secondFilterCounter += 1;

              return true;
            }

            return false;
          },
          minimizerOptions: {
            plugins,
          },
        },
      ],
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(firstFilterCounter).toBe(2);
    expect(secondFilterCounter).toBe(2);

    expect(hasLoader('multiple-loader-test-1.svg', modules)).toBe(true);
    expect(hasLoader('multiple-loader-test-2.svg', modules)).toBe(true);

    await expect(
      isOptimized('multiple-loader-test-1.svg', compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-loader-test-2.svg', compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-plugin-test-1.svg', compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-plugin-test-2.svg', compilation)
    ).resolves.toBe(true);
  });

  it('should optimizes all images with filter (multi compiler mode)', async () => {
    let firstFilterCounter = 0;
    let secondFilterCounter = 0;

    const multiStats = await webpack([
      {
        entry: path.join(fixturesPath, 'multiple-entry.js'),
        emitPluginOptions: {
          fileNames: [
            'multiple-plugin-test-1.svg',
            'multiple-plugin-test-2.svg',
          ],
        },
        imageminPluginOptions: {
          filter: (source) => {
            if (source.byteLength > 500) {
              firstFilterCounter += 1;

              return true;
            }

            return false;
          },
          minimizerOptions: {
            plugins,
          },
        },
      },
      {
        entry: path.join(fixturesPath, 'multiple-entry-2.js'),
        emitPluginOptions: {
          fileNames: [
            'multiple-plugin-test-3.svg',
            'multiple-plugin-test-4.svg',
          ],
        },
        imageminPluginOptions: {
          filter: (source) => {
            if (source.byteLength < 500) {
              secondFilterCounter += 1;

              return true;
            }

            return false;
          },
          minimizerOptions: {
            plugins,
          },
        },
      },
    ]);
    const [{ compilation: firstCompilation }] = multiStats.stats;
    const { warnings, errors, modules } = firstCompilation;

    expect(multiStats.stats).toHaveLength(2);

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(firstFilterCounter).toBe(2);

    expect(hasLoader('multiple-loader-test-1.svg', modules)).toBe(true);
    expect(hasLoader('multiple-loader-test-2.svg', modules)).toBe(true);

    await expect(
      isOptimized('multiple-loader-test-1.svg', firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-loader-test-2.svg', firstCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized('multiple-plugin-test-1.svg', firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-plugin-test-2.svg', firstCompilation)
    ).resolves.toBe(false);

    const [, { compilation: secondCompilation }] = multiStats.stats;
    const {
      warnings: secondWarnings,
      errors: secondErrors,
      modules: secondModules,
    } = secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondFilterCounter).toBe(2);

    expect(hasLoader('multiple-loader-test-3.svg', secondModules)).toBe(true);
    expect(hasLoader('multiple-loader-test-4.svg', secondModules)).toBe(true);

    await expect(
      isOptimized('multiple-loader-test-3.svg', secondCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized('multiple-loader-test-4.svg', secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized('multiple-plugin-test-3.svg', secondCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized('multiple-plugin-test-4.svg', secondCompilation)
    ).resolves.toBe(true);
  });

  it('should work with child compilation', async () => {
    const stats = await webpack({
      entry: path.resolve(__dirname, 'fixtures/loader-with-child.js'),
      emitPlugin: true,
      imageminPlugin: true,
      childPlugin: true,
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.jpg', modules)).toBe(true);
    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.svg', modules)).toBe(true);

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
    await expect(
      isOptimized('child-compilation-image.png', compilation)
    ).resolves.toBe(true);
  });

  if (!IS_WEBPACK_VERSION_NEXT) {
    it('should optimizes all images (loader + plugin) from `mini-css-extract-plugin`', async () => {
      const stats = await webpack({
        emitPlugin: true,
        imageminPlugin: true,
        entry: path.join(fixturesPath, 'entry-with-css.js'),
        MCEP: true,
      });
      const { compilation } = stats;
      const { warnings, errors } = stats.compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      // Bug in mini-css-extract-plugin
      // expect(hasLoader("url.png", modules)).toBe(true);

      await expect(isOptimized('url.png', compilation)).resolves.toBe(true);
      await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
        true
      );
    });
  }
});
