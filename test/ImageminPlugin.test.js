import path from "path";

import webpack from "webpack";

import fileType from "file-type";

import {
  fixturesPath,
  isOptimized,
  hasLoader,
  plugins,
  runWebpack,
  compile,
  readAsset,
  clearDirectory,
} from "./helpers";

import ImageMinimizerPlugin from "../src";

describe("imagemin plugin", () => {
  it("should optimizes all images (loader + plugin)", async () => {
    const stats = await runWebpack({
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes all images (loader + plugin) as minimizer", async () => {
    const stats = await runWebpack({
      asMinimizer: true,
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes all images (loader + plugin) (multi compiler mode)", async () => {
    const multiStats = await runWebpack([
      {
        entry: path.join(fixturesPath, "multiple-entry.js"),
        emitPluginOptions: {
          fileNames: ["multiple-plugin-test-1.svg"],
        },
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        },
      },
      {
        entry: path.join(fixturesPath, "multiple-entry-2.js"),
        emitPluginOptions: {
          fileNames: ["multiple-plugin-test-2.svg"],
        },
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        },
      },
    ]);

    expect(multiStats.stats).toHaveLength(2);

    const [{ compilation: firstCompilation }] = multiStats.stats;
    const { warnings, errors, modules } = multiStats.stats[0].compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-1.svg", firstCompilation)
    ).resolves.toBe(true);

    const [, { compilation: secondCompilation }] = multiStats.stats;
    const {
      warnings: secondWarnings,
      errors: secondErrors,
      modules: secondModules,
    } = multiStats.stats[1].compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(hasLoader("multiple-loader-test-3.svg", secondModules)).toBe(true);
    expect(hasLoader("multiple-loader-test-4.svg", secondModules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-3.svg", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-4.svg", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-2.svg", secondCompilation)
    ).resolves.toBe(true);
  });

  it("should optimizes successfully without any assets", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });

    const { warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should throws an error if 'imagemin' plugins don't setup (by plugin)", async () => {
    const stats = await runWebpack({
      emitPlugin: true,
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins: [] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].toString()).toMatch(/No plugins found for `imagemin`/);

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      false
    );
  });

  it("should throws an error if 'imagemin' plugins don't setup (by loader)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "single-image-loader.js"),
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins: [] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].toString()).toMatch(/No plugins found for `imagemin`/);

    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      false
    );
  });

  it("should optimizes all images (loader + plugin) and interpolate `[name][ext]` name", async () => {
    const stats = await runWebpack({
      emitPluginOptions: {
        fileNames: ["plugin-test.png"],
      },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "[name][ext]",
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes all images (loader + plugin) and interpolate `[path][name][ext]` name", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./nested/deep/loader.js"),
      emitPluginOptions: {
        fileNames: ["nested/deep/plugin-test.png"],
      },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "[path][name][ext]",
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(
      isOptimized("nested/deep/loader-test.gif", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/loader-test.jpg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/loader-test.png", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/loader-test.svg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/plugin-test.png", compilation)
    ).resolves.toBe(true);
  });

  it("should work with child compilation", async () => {
    const stats = await runWebpack({
      entry: path.resolve(__dirname, "fixtures/loader-with-child.js"),
      emitPlugin: true,
      childPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(
      isOptimized("child-compilation-image.png", compilation)
    ).resolves.toBe(true);
  });

  it("should generate real content hash", async () => {
    const compiler = await runWebpack(
      {
        output: {
          path: path.resolve(__dirname, "outputs"),
        },
        name: "[name].[contenthash].[fullhash].[ext]",
        optimization: {
          minimize: false,
          realContentHash: true,
        },
        emitPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        },
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
        continue;
      }

      const [, webpackHash] = assetName.match(/^.+?\.(.+?)\..+$/);

      const { hashDigest, hashFunction } = output;
      const cryptoHash = webpack.util
        .createHash(hashFunction)
        .update(readAsset(assetName, compiler, stats))
        .digest(hashDigest);

      expect(webpackHash).toBe(cryptoHash);
    }

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work with asset/resource", async () => {
    const compiler = await runWebpack(
      {
        fileLoaderOff: true,
        assetResource: true,
        output: {
          assetModuleFilename: "[name][ext]",
        },
        emitPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        },
      },
      true
    );

    const stats = await compile(compiler);
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.png", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    // Todo resolve png minification
    // await expect(isOptimized('loader-test.png', compilation)).resolves.toBe(
    //   true
    // );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
  });

  it("should generate real content hash with asset/resource", async () => {
    const compiler = await runWebpack(
      {
        fileLoaderOff: true,
        assetResource: true,
        output: {
          path: path.resolve(__dirname, "outputs"),
          assetModuleFilename: "[name].[contenthash].[fullhash].[ext]",
        },
        optimization: {
          minimize: false,
          realContentHash: true,
        },
        emitPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        },
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
        continue;
      }

      const [, webpackHash] = assetName.match(/^.+?\.(.+?)\..+$/);

      const { hashDigestLength, hashDigest, hashFunction } = output;
      const cryptoHash = webpack.util
        .createHash(hashFunction)
        .update(readAsset(assetName, compiler, stats))
        .digest(hashDigest)
        .slice(0, hashDigestLength);

      expect(webpackHash).toBe(cryptoHash);
    }

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work with asset/inline", async () => {
    const compiler = await runWebpack(
      {
        fileLoaderOff: true,
        assetInline: true,
        entry: path.join(fixturesPath, "./asset-inline.js"),
        emitPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        },
      },
      true
    );

    const stats = await compile(compiler);
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const result = readAsset("bundle.js", compiler, stats).toString();

    const isInlineSvg =
      /data:image\/svg\+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMCIgd2lkdGg9IjEwMCI\+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0eWxlPSJzdHJva2U6IzAwMDtzdHJva2Utd2l0aDozO2ZpbGw6cmVkIi8\+PC9zdmc\+/.test(
        result
      );

    expect(isInlineSvg).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work and use the persistent cache by default (loader + plugin)", async () => {
    const compiler = await runWebpack(
      {
        mode: "development",
        entry: path.join(fixturesPath, "./simple.js"),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
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
    const { warnings: secondWarnings, errors: secondErrors } =
      secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondStats.compilation.emittedAssets.size).toBe(0);
  });

  it('should work and use the persistent cache when "cache" option is true (loader + plugin)', async () => {
    const compiler = await runWebpack(
      {
        mode: "development",
        entry: path.join(fixturesPath, "./simple.js"),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
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
    const { warnings: secondWarnings, errors: secondErrors } =
      secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondStats.compilation.emittedAssets.size).toBe(0);
  });

  it('should work and do not use persistent cache when "cache" option is "false"', async () => {
    const compiler = await runWebpack(
      {
        cache: false,
        entry: path.join(fixturesPath, "./simple.js"),
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
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
    const { warnings: secondWarnings, errors: secondErrors } =
      secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondStats.compilation.emittedAssets.size).toBe(3);
  });

  it("should work and use the persistent cache when transform asset (loader + plugin)", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "cache-webp");

    const compiler = await runWebpack(
      {
        mode: "development",
        entry: path.join(fixturesPath, "./generator.js"),
        output: {
          path: outputDir,
        },
        emitPlugin: true,
        emitAssetPlugin: true,
        imageminPluginOptions: [
          {
            generator: [
              {
                preset: "webp",
                implementation: ImageMinimizerPlugin.squooshGenerate,
                options: {
                  encodeOptions: {
                    webp: {
                      lossless: 1,
                    },
                  },
                },
              },
            ],
            minimizer: {
              implementation: ImageMinimizerPlugin.squooshMinify,
              options: {
                mozjpeg: {
                  quality: 90,
                },
              },
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
    expect(stats.compilation.emittedAssets.size).toBe(3);

    const secondStats = await compile(compiler);
    const { compilation: secondCompilation } = secondStats;
    const { warnings: secondWarnings, errors: secondErrors } =
      secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    const extLoaderWebp = await fileType.fromFile(
      path.resolve(outputDir, "loader-test.webp")
    );
    const extLoaderJpg = await fileType.fromFile(
      path.resolve(outputDir, "plugin-test.jpg")
    );

    expect(/image\/webp/i.test(extLoaderWebp.mime)).toBe(true);
    expect(/image\/jpeg/i.test(extLoaderJpg.mime)).toBe(true);
    expect(secondStats.compilation.emittedAssets.size).toBe(0);
  });

  it("should run plugin against assets added later by plugins", async () => {
    const stats = await runWebpack({
      emitPlugin: true,
      EmitNewAssetPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("newImg.png", compilation)).resolves.toBe(true);
  });

  it("should passed asset info (plugin)", async () => {
    const compiler = await runWebpack(
      {
        mode: "development",
        copyPlugin: true,
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        },
      },
      true
    );

    const stats = await compile(compiler);
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const pluginAsset = compilation.getAsset("plugin-test.jpg");
    const { info } = pluginAsset;

    expect(info.copied).toBe(true);
    expect(info.minimized).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work and show 'minimized' in stats when only image minification used", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: ["mozjpeg"],
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;
    const jpgAsset = compilation.getAsset("plugin-test.jpg");

    expect(jpgAsset.info.size).toBeLessThan(462);
    expect(jpgAsset.info.minimized).toBe(true);
    expect(jpgAsset.info.minimizedBy).toEqual(["imagemin"]);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const stringStats = stats.toString({ relatedAssets: true });

    expect(stringStats).toMatch(
      //  /asset minimized-plugin-test.jpg.+\[from: plugin-test.jpg\] \[minimized\]/
      /asset plugin-test.jpg.+\[minimized\]/
    );
  });

  it("should work and show 'generated' in stats when only image generation used", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./generator.js"),
      imageminPluginOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;
    const webpAsset = compilation.getAsset("loader-test.webp");

    expect(webpAsset.info.generated).toBe(true);
    expect(webpAsset.info.generatedBy).toEqual(["imagemin"]);

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const stringStats = stats.toString({ relatedAssets: true });

    expect(stringStats).toMatch(
      /asset loader-test.webp.+\[from: loader-test.webp\] \[generated\]/
    );
  });

  it("should optimizes and generate images (imageminGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer.js"),
      imageminPluginOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
      },
      output: {
        path: path.resolve(__dirname, "outputs/plugin-generator-imagemin"),
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      "outputs",
      "./plugin-generator-imagemin/loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes and generate images (squooshGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|png|webp)$/i,
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  lossless: 1,
                },
              },
            },
          },
        ],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 40,
              },
              oxipng: {
                quality: 40,
              },
            },
          },
        },
      },
      output: {
        path: path.resolve(__dirname, "outputs/plugin-generator-squoosh"),
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      "outputs",
      "./plugin-generator-squoosh/loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);

    // TODO fix me
    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      false
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      false
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      false
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      false
    );
  });

  it("should throw an error on empty minimizer", async () => {
    await expect(async () => {
      await runWebpack({
        emitPlugin: true,
        imageminPluginOptions: { minimizer: undefined },
      });
    }).rejects.toThrow(
      /Not configured 'minimizer' or 'generator' options, please setup them/
    );
  });

  it("should throw an error on empty generator", async () => {
    await expect(async () => {
      await runWebpack({
        emitPlugin: true,
        imageminPluginOptions: { generator: undefined },
      });
    }).rejects.toThrow(
      /Not configured 'minimizer' or 'generator' options, please setup them/
    );
  });
});
