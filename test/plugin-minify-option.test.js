import path from "path";

import ImageMinimizerPlugin from "../src";

import { fixturesPath, webpack, isOptimized } from "./helpers";

jest.setTimeout(30000);

describe("plugin minify option", () => {
  it('should work with "imagemin" minifier', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminMinify,
        minimizerOptions: {
          plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
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

  it('should emit warning when "imagemin" minifier used for generation', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminMinify,
        minimizerOptions: {
          plugins: ["webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(warnings[0].toString()).toMatch(
      'Error: "imageminMinify" function do not support generate to "webp" from "plugin-test.jpg". Use "imageminGenerate"'
    );
    expect(errors).toHaveLength(0);
  });

  it("should work when minify is custom function", async () => {
    expect.assertions(6);

    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: (original, minifiOptions) => {
          expect(original.data).toBeDefined();
          expect(original.filename).toBeDefined();
          expect(minifiOptions).toBeDefined();

          return original;
        },
        minimizerOptions: {
          plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
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

  it("should work if minify is array && minimizerOptions is object", async () => {
    expect.assertions(6);

    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (original, minifiOptions) => {
            expect(original.filename).toBeDefined();
            expect(original.data).toBeDefined();
            expect(minifiOptions).toBeDefined();

            return original;
          },
        ],
        minimizerOptions: {
          plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
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

  it("should work if minify is array && minimizerOptions is array", async () => {
    expect.assertions(5);

    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (data, minifiOptions) => {
            expect("options2" in minifiOptions).toBe(true);

            return data;
          },
          (data, minifiOptions) => {
            expect("options3" in minifiOptions).toBe(true);

            return data;
          },
        ],
        minimizerOptions: [
          {
            plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
          },
          {
            options2: "passed",
          },
          {
            options3: "passed",
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

  it('should work with "squooshMinify" minifier', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(353);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should work with "squooshMinify" minifier and minimizerOptions', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
        minimizerOptions: {
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
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.jpg").info.size).toBeLessThan(335);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should emit warning when file is not supported by "squooshMinify"', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: {
        fileNames: ["plugin-test.svg"],
      },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(compilation.getAsset("plugin-test.svg")).toBeDefined();
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].toString()).toMatch(
      'Error: "plugin-test.svg" is not minimized, because has an unsupported format'
    );
  });

  it('should work with "squooshGenerate" and "squooshMinify"', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      imageminPluginOptions: {
        minify: [
          ImageMinimizerPlugin.squooshGenerate,
          ImageMinimizerPlugin.squooshMinify,
        ],
        minimizerOptions: [
          {
            encodeOptions: {
              webp: {},
            },
          },
          {
            encodeOptions: {
              mozjpeg: {
                quality: 75,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const jpgAsset = compilation.getAsset("plugin-test.jpg");
    const webpAsset = compilation.getAsset("plugin-test.webp");

    expect(jpgAsset.info.size).toBeLessThan(353);
    expect(jpgAsset.info.minimized).toBe(true);
    expect(jpgAsset.info.minimizedBy).toEqual(["squoosh"]);

    expect(webpAsset.info.size).toBeLessThan(45);
    expect(webpAsset.info.generated).toBe(true);
    expect(webpAsset.info.generatedBy).toEqual(["squoosh"]);
    expect(webpAsset.info.minimized).toBe(true);
    expect(webpAsset.info.minimizedBy).toEqual(["squoosh"]);

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
