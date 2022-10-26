import path from "path";

import fs from "fs";
import webpack from "webpack";

import fileType from "file-type";

import tempy from "tempy";
import pify from "pify";
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

jest.setTimeout(100000);

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
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins: [] },
          },
        ],
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
      /asset loader-test.webp.+\[from: loader-test.png\] \[generated\]/
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
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
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
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
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

  it("should optimizes and generate animated images (sharpGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-animation.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|png|webp|gif)$/i,
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 40,
                },
              },
            },
          },
        ],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              gif: {
                colors: 8,
              },
            },
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const webpAsset = compilation.getAsset("animation-test.webp");
    const gifAsset = compilation.getAsset("animation-test.gif");

    expect(webpAsset.info.size).toBeGreaterThan(4_000);
    expect(webpAsset.info.size).toBeLessThan(130_000);

    expect(gifAsset.info.size).toBeGreaterThan(2_000);
    expect(gifAsset.info.size).toBeLessThan(130_000);
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

  it("should generate and do not throw an error on unsupported file types in minimizer", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
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
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
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

  it("should generate and allow to generate avif option using 'imageminGenerate'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/avif/i.test(ext.mime)).toBe(true);
  });

  it("should generate and allow to use any name in the 'preset' option using 'imageminGenerate'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-3.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            preset: "webp-other",
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

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });

  it("should generate and allow to use any name in the 'preset' option using 'squooshGenerate'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-3.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            preset: "webp-other",
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
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });

  it("should generate throw an error on multiple 'encodeOptions' options using 'squooshGenerate'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-3.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            preset: "webp-other",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  lossless: 1,
                },
                avif: {},
              },
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /Multiple values for the 'encodeOptions' option is not supported for 'loader-test.png', specify only one codec for the generator/
    );
  });

  it("should generate throw an error on multiple 'encodeOptions' options using 'sharpGenerate'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-3.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            preset: "webp-other",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: {
                  lossless: true,
                },
                avif: {},
              },
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /Multiple values for the 'encodeOptions' option is not supported for 'loader-test.png', specify only one codec for the generator/
    );
  });

  it("should return error on empty encodeOptions with 'sharpGenerate'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-3.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            preset: "webp-other",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {},
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /No result from 'sharp' for '.+', please configure the 'encodeOptions' option to generate images/
    );
  });

  it("should not try to generate and minimize twice", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer.js"),
      imageminPluginOptions: [
        {
          test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
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
        },
        {
          test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
          generator: [
            {
              preset: "webp",
              implementation: ImageMinimizerPlugin.squooshGenerate,
              options: {
                encodeOptions: {
                  webp: {
                    quality: 0,
                  },
                },
              },
            },
          ],
        },
      ],
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
    );

    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);

    const webpAsset = compilation.getAsset("loader-test.webp");

    expect(webpAsset.info.generated).toBe(true);
    expect(webpAsset.info.generatedBy).toEqual(["squoosh"]);

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

  it("should generate and minimize images using absolute URLs using asset modules", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-2.js"),
      fileLoaderOff: true,
      experiments: {
        buildHttp: {
          allowedUris: [/^http(s)?:/],
          cacheLocation: path.resolve(fixturesPath, "./cache/absolute-url"),
          lockfileLocation: path.resolve(
            fixturesPath,
            "./cache/absolute-url/lock.json"
          ),
        },
      },
      imageminPluginOptions: {
        generator: [
          {
            preset: "webp",
            filename: "generated-[name][ext]",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            filename: "minimized-[name][ext]",
            options: { plugins },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(Object.keys(compilation.assets)).toContain(
      "generated-loader-test.webp"
    );
    expect(Object.keys(compilation.assets)).toContain(
      "generated-PNG_transparency_demonstration_1.webp"
    );
    expect(Object.keys(compilation.assets)).toContain("generated-Example.webp");
    expect(Object.keys(compilation.assets)).toContain("minimized-icon.svg");

    const webpAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./generated-loader-test.webp"
    );
    const ext = await fileType.fromFile(webpAsset);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);

    const webpAsset1 = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./generated-PNG_transparency_demonstration_1.webp"
    );
    const ext1 = await fileType.fromFile(webpAsset1);

    expect(/image\/webp/i.test(ext1.mime)).toBe(true);

    const webpAsset2 = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./generated-Example.webp"
    );
    const ext2 = await fileType.fromFile(webpAsset2);

    expect(/image\/webp/i.test(ext2.mime)).toBe(true);

    await expect(
      isOptimized(["minimized-loader-test.jpg", "loader-test.jpg"], compilation)
    ).resolves.toBe(true);

    const bundleFilename = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./bundle.js"
    );
    const bundle = await pify(fs.readFile)(bundleFilename);
    const URIRegEx = /"(data:([^;,]+)?((?:;[^;,]+)*?)(?:;(base64))?,(.*))"/gi;
    const extractedDataURI = bundle.toString().match(URIRegEx);

    expect(extractedDataURI[1].length).toBeLessThan(95801);
  });

  it("should generate and minimize images using absolute URLs using file-loader", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer.js"),
      experiments: {
        buildHttp: {
          allowedUris: [/^http(s)?:/],
          cacheLocation: path.resolve(fixturesPath, "./cache/absolute-url"),
          lockfileLocation: path.resolve(
            fixturesPath,
            "./cache/absolute-url/lock.json"
          ),
        },
      },
      imageminPluginOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            filename: "generated-[name][ext]",
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            filename: "minimized-[name][ext]",
            options: { plugins },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(Object.keys(compilation.assets)).toContain(
      "minimized-loader-test.gif"
    );
    expect(Object.keys(compilation.assets)).toContain(
      "minimized-loader-test.jpg"
    );
    expect(Object.keys(compilation.assets)).toContain(
      "minimized-loader-test.png"
    );
    expect(Object.keys(compilation.assets)).toContain(
      "generated-loader-test.webp"
    );
    expect(Object.keys(compilation.assets)).toContain(
      "minimized-loader-test.svg"
    );

    const webpAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./generated-loader-test.webp"
    );
    const ext = await fileType.fromFile(webpAsset);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);

    await expect(
      isOptimized(["minimized-loader-test.gif", "loader-test.gif"], compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized(["minimized-loader-test.jpg", "loader-test.jpg"], compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized(["minimized-loader-test.png", "loader-test.png"], compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized(["minimized-loader-test.svg", "loader-test.svg"], compilation)
    ).resolves.toBe(true);
  });

  it("should allow to filter images for generation", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-3.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            preset: "webp-other",
            filter: () => false,
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
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.png"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/png/i.test(ext.mime)).toBe(true);
  });

  it("should throw an error on unknown format (squooshGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-5.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp|txt)$/i,
        generator: [
          {
            preset: "avif",
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
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /Error with 'loader-test.txt': Binary blob has an unsupported format/g
    );
  });

  it("should throw an error on unknown format (sharpGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-5.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp|txt)$/i,
        generator: [
          {
            preset: "avif",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: {
                  lossless: true,
                },
              },
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /Error with 'loader-test.txt': Input file has an unsupported format/g
    );
  });

  it("should minimize and ignore unsupported data URI", async () => {
    let minimized = 0;

    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-6.js"),
      fileLoaderOff: true,
      imageminPluginOptions: {
        minimizer: [
          {
            implementation: (...args) => {
              minimized += 1;

              return ImageMinimizerPlugin.imageminMinify(...args);
            },
            filename: "minimized-[name][ext]",
            options: { plugins },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(minimized).toBe(1);

    const bundleFilename = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./bundle.js"
    );
    const bundle = await pify(fs.readFile)(bundleFilename);
    const URIRegEx = /"(data:([^;,]+)?((?:;[^;,]+)*?)(?:;(base64))?,(.*))"/gi;
    const extractedDataURI = bundle.toString().match(URIRegEx);

    expect(extractedDataURI[1].length).toBeLessThan(95801);
  });

  it("should generate image for 'import' type", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            type: "import",
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/avif/i.test(ext.mime)).toBe(true);
  });

  it("should generate image for 'asset' type", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "empty-entry.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            type: "asset",
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.avif"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/avif/i.test(ext.mime)).toBe(true);
  });

  it("should not throw an error when no presets found using the `asset` type", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            type: "asset",
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const loaderFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const loaderExt = await fileType.fromFile(loaderFile);

    expect(/image\/avif/i.test(loaderExt.mime)).toBe(true);
  });

  it("should generate image for 'import' and 'asset' types", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        generator: [
          {
            type: "import",
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(compilation.assets)).toContain("loader-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.avif");

    const loaderFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const loaderExt = await fileType.fromFile(loaderFile);

    expect(/image\/avif/i.test(loaderExt.mime)).toBe(true);

    const pluginFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.avif"
    );
    const pluginExt = await fileType.fromFile(pluginFile);

    expect(/image\/avif/i.test(pluginExt.mime)).toBe(true);
  });

  it("should generate images for 'import' and 'asset' types and keep original assets", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        deleteOriginalAssets: false,
        generator: [
          {
            type: "import",
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(compilation.assets)).toContain("plugin-test.jpg");
    expect(Object.keys(compilation.assets)).toContain("loader-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.avif");

    const loaderFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const loaderExt = await fileType.fromFile(loaderFile);

    expect(/image\/avif/i.test(loaderExt.mime)).toBe(true);

    const pluginFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.avif"
    );
    const pluginExt = await fileType.fromFile(pluginFile);

    expect(/image\/avif/i.test(pluginExt.mime)).toBe(true);
  });

  it("should generate image for 'import' and 'asset' types, minimizer original asset and keep", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        deleteOriginalAssets: false,
        generator: [
          {
            type: "import",
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
        ],
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(compilation.assets)).toContain("plugin-test.jpg");
    expect(Object.keys(compilation.assets)).toContain("loader-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.avif");

    const loaderFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const loaderExt = await fileType.fromFile(loaderFile);

    expect(/image\/avif/i.test(loaderExt.mime)).toBe(true);

    const pluginFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.avif"
    );
    const pluginExt = await fileType.fromFile(pluginFile);

    expect(/image\/avif/i.test(pluginExt.mime)).toBe(true);

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
  });

  it("should generate image for 'import' and 'asset' types, minimizer original asset and keep #2", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        deleteOriginalAssets: false,
        generator: [
          {
            type: "import",
            preset: "avif",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-avif"],
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(compilation.assets)).toContain("plugin-test.jpg");
    expect(Object.keys(compilation.assets)).toContain("loader-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.webp");

    const loaderFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const loaderExt = await fileType.fromFile(loaderFile);

    expect(/image\/avif/i.test(loaderExt.mime)).toBe(true);

    const pluginFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.avif"
    );
    const pluginExt = await fileType.fromFile(pluginFile);

    expect(/image\/avif/i.test(pluginExt.mime)).toBe(true);

    const pluginWebp = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.webp"
    );
    const pluginWebExt = await fileType.fromFile(pluginWebp);

    expect(/image\/webp/i.test(pluginWebExt.mime)).toBe(true);

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
  });

  it("should generate image for 'import' and 'asset' types, minimizer original asset and keep #3", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
        deleteOriginalAssets: false,
        generator: [
          {
            type: "import",
            preset: "avif",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                avif: {
                  quality: 1,
                },
              },
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  lossless: 1,
                },
              },
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                avif: {
                  quality: 1,
                },
              },
            },
          },
        ],
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {
              mozjpeg: {
                quality: 90,
              },
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(compilation.assets)).toContain("plugin-test.jpg");
    expect(Object.keys(compilation.assets)).toContain("loader-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.webp");

    const loaderFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const loaderExt = await fileType.fromFile(loaderFile);

    expect(/image\/avif/i.test(loaderExt.mime)).toBe(true);

    const pluginFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.avif"
    );
    const pluginExt = await fileType.fromFile(pluginFile);

    expect(/image\/avif/i.test(pluginExt.mime)).toBe(true);

    const pluginWebp = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.webp"
    );
    const pluginWebExt = await fileType.fromFile(pluginWebp);

    expect(/image\/webp/i.test(pluginWebExt.mime)).toBe(true);

    // await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
    //     true
    // );
  });

  it("should generate image for 'import' and 'asset' types, minimizer original asset, keep and cache result", async () => {
    const compiler = await runWebpack(
      {
        entry: path.join(fixturesPath, "generator-and-minimizer-4.js"),
        cache: {
          type: "filesystem",
          cacheLocation: tempy.directory(),
        },
        copyPlugin: true,
        imageminPluginOptions: {
          test: /\.(jpe?g|gif|json|svg|png|webp)$/i,
          deleteOriginalAssets: false,
          generator: [
            {
              type: "import",
              preset: "avif",
              implementation: ImageMinimizerPlugin.imageminGenerate,
              options: {
                plugins: ["imagemin-avif"],
              },
            },
            {
              type: "asset",
              implementation: ImageMinimizerPlugin.imageminGenerate,
              options: {
                plugins: ["imagemin-avif"],
              },
            },
            {
              type: "asset",
              implementation: ImageMinimizerPlugin.imageminGenerate,
              options: {
                plugins: ["imagemin-webp"],
              },
            },
          ],
          minimizer: [
            {
              implementation: ImageMinimizerPlugin.imageminMinify,
              options: { plugins },
            },
          ],
        },
      },
      true
    );
    const stats = await compile(compiler);
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(compilation.assets)).toContain("plugin-test.jpg");
    expect(Object.keys(compilation.assets)).toContain("loader-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.avif");
    expect(Object.keys(compilation.assets)).toContain("plugin-test.webp");

    const loaderFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.avif"
    );
    const loaderExt = await fileType.fromFile(loaderFile);

    expect(/image\/avif/i.test(loaderExt.mime)).toBe(true);

    const pluginFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.avif"
    );
    const pluginExt = await fileType.fromFile(pluginFile);

    expect(/image\/avif/i.test(pluginExt.mime)).toBe(true);

    const pluginWebp = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.webp"
    );
    const pluginWebExt = await fileType.fromFile(pluginWebp);

    expect(/image\/webp/i.test(pluginWebExt.mime)).toBe(true);

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );

    expect(stats.compilation.emittedAssets.size).toBe(5);

    const secondStats = await compile(compiler);
    const { warnings: secondWarnings, errors: secondErrors } =
      secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondStats.compilation.emittedAssets.size).toBe(0);

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });

  it("should generate image from copied assets", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "empty-entry.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        generator: [
          {
            type: "asset",
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

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });

  it("should generate image from copied assets, minimize and keep original", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "empty-entry.js"),
      copyPlugin: true,
      imageminPluginOptions: {
        deleteOriginalAssets: false,
        generator: [
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
          {
            type: "asset",
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: ["imagemin-mozjpeg"],
            },
          },
        ],
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const webpFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.webp"
    );
    const webpExt = await fileType.fromFile(webpFile);

    expect(/image\/webp/i.test(webpExt.mime)).toBe(true);

    const fileJpg = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./plugin-test.jpg"
    );
    const extJpg = await fileType.fromFile(fileJpg);

    expect(/image\/jpeg/i.test(extJpg.mime)).toBe(true);

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
  });

  it("should work with mini-css-extract-plugin", async () => {
    const stats = await runWebpack({
      fileLoaderOff: true,
      assetResource: true,
      MCEP: true,
      entry: path.join(fixturesPath, "entry-with-css.js"),
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
        minimizer: [
          {
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
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins: ["svgo"] },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    // const pngFile = path.resolve(
    //   __dirname,
    //   compilation.options.output.path,
    //   "./url.png"
    // );
    // const pngExt = await fileType.fromFile(pngFile);
    //
    // expect(/image\/png/i.test(pngExt.mime)).toBe(true);
    //
    // const webpFile = path.resolve(
    //   __dirname,
    //   compilation.options.output.path,
    //   "./url.webp"
    // );
    // const webpExt = await fileType.fromFile(webpFile);
    //
    // expect(/image\/webp/i.test(webpExt.mime)).toBe(true);
    //
    const cssFile = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./main.css"
    );

    const cssContent = await fs.promises.readFile(cssFile, "utf-8");

    expect(cssContent).toMatchSnapshot("main.css");
  });
});
