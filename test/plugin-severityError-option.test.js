import path from 'path';

import { fixturesPath, isOptimized, plugins, webpack } from './helpers';

describe('plugin severityError option', () => {
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
      optimization: {
        noEmitOnErrors: false,
      },
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
      optimization: {
        noEmitOnErrors: false,
      },
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
});
