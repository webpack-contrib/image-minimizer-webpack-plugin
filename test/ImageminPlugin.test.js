import path from 'path';

import crypto from 'crypto';

import fileType from 'file-type';

import {
  fixturesPath,
  isOptimized,
  hasLoader,
  plugins,
  webpack,
  compile,
  readAsset,
  clearDirectory,
} from './helpers';

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

  it('should generate real content hash', async () => {
    const compiler = await webpack(
      {
        output: {
          path: path.resolve(__dirname, 'outputs'),
        },
        name: '[name].[contenthash].[fullhash].[ext]',
        optimization: {
          minimize: false,
          realContentHash: true,
        },
        emitPlugin: true,
        imageminPlugin: true,
      },
      true
    );

    const stats = await compile(compiler);

    const {
      warnings,
      errors,
      assets,
      options: { output },
    } = stats.compilation;

    expect.assertions(6);

    for (const assetName of Object.keys(assets)) {
      const match = assetName.match(/^.+?\.(.+?)\..+$/);

      if (!match) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const [, webpackHash] = assetName.match(/^.+?\.(.+?)\..+$/);

      const { hashDigest, hashFunction } = output;
      const cryptoHash = crypto
        .createHash(hashFunction)
        .update(readAsset(assetName, compiler, stats))
        .digest(hashDigest);

      expect(webpackHash).toBe(cryptoHash);
    }

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work with asset/resource', async () => {
    const compiler = await webpack(
      {
        fileLoaderOff: true,
        assetResource: true,
        output: {
          assetModuleFilename: '[name][ext]',
        },
        experiments: {
          asset: true,
        },
        emitPlugin: true,
        imageminPlugin: true,
      },
      true
    );

    const stats = await compile(compiler);
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader('loader-test.gif', modules)).toBe(true);
    expect(hasLoader('loader-test.jpg', modules)).toBe(true);
    expect(hasLoader('loader-test.png', modules)).toBe(true);
    expect(hasLoader('loader-test.svg', modules)).toBe(true);

    await expect(isOptimized('loader-test.gif', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('loader-test.jpg', compilation)).resolves.toBe(
      true
    );
    // Todo resolve png minification
    // await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
    //   true
    // );
    await expect(isOptimized('loader-test.svg', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      true
    );
  });

  it('should generate real content hash with asset/resource', async () => {
    const compiler = await webpack(
      {
        fileLoaderOff: true,
        assetResource: true,
        output: {
          path: path.resolve(__dirname, 'outputs'),
          assetModuleFilename: '[name].[contenthash].[fullhash].[ext]',
        },
        experiments: {
          asset: true,
        },
        optimization: {
          minimize: false,
          realContentHash: true,
        },
        emitPlugin: true,
        imageminPlugin: true,
      },
      true
    );

    const stats = await compile(compiler);

    const {
      warnings,
      errors,
      assets,
      options: { output },
    } = stats.compilation;

    expect.assertions(6);

    for (const assetName of Object.keys(assets)) {
      const match = assetName.match(/^.+?\.(.+?)\..+$/);

      if (!match) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const [, webpackHash] = assetName.match(/^.+?\.(.+?)\..+$/);

      const { hashDigestLength, hashDigest, hashFunction } = output;
      const cryptoHash = crypto
        .createHash(hashFunction)
        .update(readAsset(assetName, compiler, stats))
        .digest(hashDigest)
        .slice(0, hashDigestLength);

      expect(webpackHash).toBe(cryptoHash);
    }

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should regenerate contenthash after minimize', async () => {
    const compiler = await webpack(
      {
        fileLoaderOff: true,
        entry: path.join(fixturesPath, './simple-emit.js'),
        assetResource: true,
        output: {
          path: path.resolve(__dirname, 'outputs'),
          filename: '[name].[contenthash].[fullhash].[ext]',
        },
        experiments: {
          asset: true,
        },
        imageminPlugin: true,
        copyPlugin: true,
        copyPluginOptions: {
          patterns: [
            {
              from: 'plugin-test.jpg',
              to: '[name].[contenthash]-[contenthash][ext]',
            },
          ],
        },
      },
      true
    );

    const stats = await compile(compiler);

    const { warnings, errors } = stats.compilation;

    const expectedName =
      'plugin-test.f48748954547acf94595-f48748954547acf94595.jpg';

    const { info } = stats.compilation.getAsset(expectedName);

    expect(info.contenthash).toBe('f48748954547acf94595');
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work with asset/inline', async () => {
    const compiler = await webpack(
      {
        fileLoaderOff: true,
        assetInline: true,
        experiments: {
          asset: true,
        },
        entry: path.join(fixturesPath, './asset-inline.js'),
        emitPlugin: true,
        imageminPlugin: true,
      },
      true
    );

    const stats = await compile(compiler);
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const result = readAsset('bundle.js', compiler, stats).toString();

    const isInlineSvg = /data:image\/svg\+xml;base64,PHN2Zz48c3R5bGUvPjwvc3ZnPg==/.test(
      result
    );

    expect(isInlineSvg).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});

describe('imagemin plugin - persistent cache', () => {
  it('should work and use the persistent cache by default (loader + plugin)', async () => {
    const compiler = await webpack(
      {
        mode: 'development',
        entry: path.join(fixturesPath, './simple.js'),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
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

    expect(stats.compilation.emittedAssets.size).toBe(3);

    const secondStats = await compile(compiler);
    const {
      warnings: secondWarnings,
      errors: secondErrors,
    } = secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondStats.compilation.emittedAssets.size).toBe(0);
  });

  it('should work and use the persistent cache when "cache" option is true (loader + plugin)', async () => {
    const compiler = await webpack(
      {
        mode: 'development',
        entry: path.join(fixturesPath, './simple.js'),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
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

    expect(stats.compilation.emittedAssets.size).toBe(3);

    const secondStats = await compile(compiler);
    const {
      warnings: secondWarnings,
      errors: secondErrors,
    } = secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondStats.compilation.emittedAssets.size).toBe(0);
  });

  it('should work and do not use persistent cache when "cache" option is "false"', async () => {
    const compiler = await webpack(
      {
        cache: false,
        entry: path.join(fixturesPath, './simple.js'),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
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

    expect(stats.compilation.emittedAssets.size).toBe(3);

    const secondStats = await compile(compiler);
    const {
      warnings: secondWarnings,
      errors: secondErrors,
    } = secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondStats.compilation.emittedAssets.size).toBe(3);
  });

  it('should work and use the persistent cache when transform asset (loader + plugin)', async () => {
    const outputDir = path.resolve(__dirname, 'outputs', 'cache-webp');

    const compiler = await webpack(
      {
        mode: 'development',
        entry: path.join(fixturesPath, './simple.js'),
        output: {
          path: outputDir,
        },
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: [
          {
            filename: '[name].webp',
            minimizerOptions: {
              plugins: ['imagemin-webp'],
            },
          },
          {
            filename: '[name].json',
            minimizerOptions: {
              plugins: ['../../test/imagemin-base64.js'],
            },
          },
        ],
      },
      true
    );

    clearDirectory(outputDir);

    const stats = await compile(compiler);

    const { compilation } = stats;

    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(stats.compilation.emittedAssets.size).toBe(7);

    const secondStats = await compile(compiler);
    const { compilation: secondCompilation } = secondStats;
    const {
      warnings: secondWarnings,
      errors: secondErrors,
    } = secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    const extPluginWebp = await fileType.fromFile(
      path.resolve(outputDir, 'plugin-test.webp')
    );
    const extPluginJson = await fileType.fromFile(
      path.resolve(outputDir, 'plugin-test.json')
    );
    const extLoaderWebp = await fileType.fromFile(
      path.resolve(outputDir, 'loader-test.webp')
    );
    const extLoaderJson = await fileType.fromFile(
      path.resolve(outputDir, 'loader-test.json')
    );

    // eslint-disable-next-line no-undefined
    expect(extPluginJson).toBe(undefined);
    // eslint-disable-next-line no-undefined
    expect(extLoaderJson).toBe(undefined);
    expect(/image\/webp/i.test(extPluginWebp.mime)).toBe(true);
    expect(/image\/webp/i.test(extLoaderWebp.mime)).toBe(true);

    expect(secondStats.compilation.emittedAssets.size).toBe(0);
  });

  it('should run plugin against assets added later by plugins', async () => {
    const stats = await webpack({
      emitPlugin: true,
      imageminPlugin: true,
      EmitNewAssetPlugin: true,
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized('plugin-test.jpg', compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized('newImg.png', compilation)).resolves.toBe(true);
  });

  it('should passed asset info (plugin)', async () => {
    const compiler = await webpack(
      {
        mode: 'development',
        imageminPlugin: true,
        copyPlugin: true,
      },
      true
    );

    const stats = await compile(compiler);
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const pluginAsset = compilation.getAsset('plugin-test.jpg');
    const { info } = pluginAsset;

    expect(info.copied).toBe(true);
    expect(info.minimized).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
