import path from "path";

import fileType from "file-type";
import ImageMinimizerPlugin from "../src";

import {
  fixturesPath,
  runWebpack,
  isOptimized,
  plugins,
  hasLoader,
} from "./helpers";

jest.setTimeout(10000);

describe("plugin minify option", () => {
  it('should work with "imageminMinify" minifier', async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work with "squooshMinify" minifier', async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(353);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work with "sharpMinify" minifier', async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: { jpeg: { quality: 90 } },
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(353);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work when minify is custom function", async () => {
    expect.assertions(5);

    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: (data, minifiOptions) => {
            const [[, input]] = Object.entries(data);

            expect(data).toBeDefined();
            expect(minifiOptions).toBeDefined();

            return {
              data: input,
            };
          },
          options: {
            plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      false
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work if minify is array && minimizerOptions without values", async () => {
    expect.assertions(5);

    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
            },
          },
          {
            implementation: (input, minifiOptions) => {
              expect(input).toBeDefined();
              expect(minifiOptions).toBeUndefined();

              return input;
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work if minify is array && minimizerOptions is array", async () => {
    expect.assertions(5);

    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
            },
          },
          {
            implementation: (input, minifiOptions) => {
              expect("options2" in minifiOptions).toBe(true);

              return input;
            },
            options: {
              options2: "passed",
            },
          },
          {
            implementation: (input, minifiOptions) => {
              expect("options3" in minifiOptions).toBe(true);

              return input;
            },
            options: {
              options3: "passed",
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work with 'imageminMinify' minifier and 'minimizerOptions'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(462);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work with 'squooshMinify' minifier and 'minimizerOptions'", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 75,
              },
              webp: {
                lossless: 1,
              },
              avif: {
                cqLevel: 0,
              },
            },
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(335);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should optimizes all images (loader + plugin) exclude filtered", async () => {
    const stats = await runWebpack({
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
          filter: (source, sourcePath) => {
            expect(source).toBeInstanceOf(Buffer);
            expect(typeof sourcePath).toBe("string");

            if (
              sourcePath.endsWith("loader-test.jpg") ||
              sourcePath.endsWith("plugin-test.jpg")
            ) {
              return false;
            }

            return true;
          },
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
      false
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      false
    );
  });

  it("should optimizes all images with filter (multiple plugins)", async () => {
    let firstFilterCounter = 0;
    let secondFilterCounter = 0;

    const stats = await runWebpack({
      entry: path.join(fixturesPath, "multiple-entry.js"),
      emitPluginOptions: {
        fileNames: ["multiple-plugin-test-1.svg", "multiple-plugin-test-2.svg"],
      },
      imageminPluginOptions: [
        {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
            filter: (source) => {
              if (source.byteLength > 500) {
                firstFilterCounter += 1;

                return true;
              }

              return false;
            },
          },
        },
        {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
            filter: (source) => {
              if (source.byteLength < 500) {
                secondFilterCounter += 1;

                return true;
              }

              return false;
            },
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

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-1.svg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-2.svg", compilation)
    ).resolves.toBe(true);
  });

  it("should optimizes all images with filter (multi compiler mode)", async () => {
    let firstFilterCounter = 0;
    let secondFilterCounter = 0;

    const multiStats = await runWebpack([
      {
        entry: path.join(fixturesPath, "multiple-entry.js"),
        emitPluginOptions: {
          fileNames: [
            "multiple-plugin-test-1.svg",
            "multiple-plugin-test-2.svg",
          ],
        },
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
            filter: (source) => {
              if (source.byteLength > 500) {
                firstFilterCounter += 1;

                return true;
              }

              return false;
            },
          },
        },
      },
      {
        entry: path.join(fixturesPath, "multiple-entry-2.js"),
        emitPluginOptions: {
          fileNames: [
            "multiple-plugin-test-3.svg",
            "multiple-plugin-test-4.svg",
          ],
        },
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
            filter: (source) => {
              if (source.byteLength < 500) {
                secondFilterCounter += 1;

                return true;
              }

              return false;
            },
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

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", firstCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized("multiple-plugin-test-1.svg", firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-2.svg", firstCompilation)
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

    expect(hasLoader("multiple-loader-test-3.svg", secondModules)).toBe(true);
    expect(hasLoader("multiple-loader-test-4.svg", secondModules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-3.svg", secondCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized("multiple-loader-test-4.svg", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-3.svg", secondCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized("multiple-plugin-test-4.svg", secondCompilation)
    ).resolves.toBe(true);
  });

  it("should transform image to webp", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "[path][name][ext]",
          options: { plugins: ["imagemin-pngquant"] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );
    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./nested/deep/plugin-test.png"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/png/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should transform image to webp with flat filename", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "[name][ext]",
          options: { plugins: ["imagemin-pngquant"] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("plugin-test.png")
    );
    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "plugin-test.png"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/png/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should transform image to webp with nested filename", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["plugin-test.png"] },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "./nested/deep/[name][ext]",
          options: { plugins: ["imagemin-pngquant"] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );
    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./nested/deep/plugin-test.png"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/png/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should transform image to webp with filename pointing to other directory", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "./other/[name][ext]",
          options: { plugins: ["imagemin-pngquant"] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./other/plugin-test.png")
    );
    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./other/plugin-test.png"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/png/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should transform image to webp with filename when filename is function", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: () => "./other/[name][ext]",
          options: { plugins: ["imagemin-pngquant"] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./other/plugin-test.png")
    );
    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./other/plugin-test.png"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/png/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should work with 'sharpMinify' minifier and don't rename unsupported asset", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./svg-and-jpg.js"),
      fileLoaderOff: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          filename: "minified-xxx-[name]-yyy[ext]",
          options: {
            encodeOptions: { jpeg: { quality: 90 } },
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const originalAsset = Object.keys(assets).filter((asset) =>
      asset.includes("loader-test.svg")
    );
    const minifiedAsset = Object.keys(assets).filter((asset) =>
      asset.includes("minified-xxx-loader-test-yyy.jpg")
    );

    expect(originalAsset).toHaveLength(1);
    expect(minifiedAsset).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should rename if minimizer is array", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./svg-and-jpg.js"),
      fileLoaderOff: true,
      imageminPluginOptions: {
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            filename: "minified-by-sharp-[name][ext]",
            options: {
              encodeOptions: { jpeg: { quality: 90 } },
            },
          },
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            filename: "should-be-skipped-[name][ext]",
            options: {
              encodeOptions: { jpeg: { quality: 90 } },
            },
          },
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            filename: "minified-by-svgo-[name][ext]",
            options: {
              plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
            },
          },
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            filename: "should-be-skipped-[name][ext]",
            options: {
              plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const sharpAsset = Object.keys(assets).filter((asset) =>
      asset.includes("minified-by-sharp-loader-test.jpg")
    );
    const svgoAsset = Object.keys(assets).filter((asset) =>
      asset.includes("minified-by-svgo-loader-test.svg")
    );
    const skippedAsset = Object.keys(assets).filter((asset) =>
      asset.includes("should-be-skipped-loader-test.svg")
    );

    expect(sharpAsset).toHaveLength(1);
    expect(svgoAsset).toHaveLength(1);
    expect(skippedAsset).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
