import path from "path";
import fileType from "file-type";
import ImageMinimizerPlugin from "../src";

import { runWebpack, isOptimized, plugins, fixturesPath } from "./helpers";

describe("loader minify option", () => {
  it("should work with object notation of the 'minifier' option", async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
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

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

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

  it("should work with array notation of the 'minifier' option", async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

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

  it("should work with array notation of the 'minifier' option #2", async () => {
    expect.assertions(14);

    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
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
              expect(minifiOptions).toBeDefined();

              return input;
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

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

  it("should work with array notation of the 'minifier' option #3", async () => {
    expect.assertions(14);

    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
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

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

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

  it("should work when minify is custom function", async () => {
    expect.assertions(14);

    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: {
          implementation: (input, minifiOptions) => {
            expect(input).toBeDefined();
            expect(minifiOptions).toBeDefined();

            return input;
          },
          options: {
            plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

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

  it("should emit errors", async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: {
          implementation: () => {
            throw new Error("test error");
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(errors).toHaveLength(4);
    expect(warnings).toHaveLength(0);

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

  it('should work with "imageminMinify" minifier', async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
          },
        },
      },
    });
    const { compilation } = stats;
    const { errors } = compilation;

    expect(errors).toHaveLength(0);
    expect(compilation.getAsset("loader-test.jpg").info.size).toBeLessThan(631);
    expect(compilation.getAsset("loader-test.png").info.size).toBeLessThan(
      71000
    );
  });

  it('should work with "squooshMinify" minifier', async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
        },
      },
    });
    const { compilation } = stats;
    const { errors } = compilation;

    expect(errors).toHaveLength(0);
    expect(compilation.getAsset("loader-test.jpg").info.size).toBeLessThan(631);
    expect(compilation.getAsset("loader-test.png").info.size).toBeLessThan(
      71000
    );
  });

  it("should optimizes all images exclude filtered", async () => {
    const stats = await runWebpack({
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filter: (source, filename) => {
            expect(source).toBeInstanceOf(Buffer);
            expect(typeof filename).toBe("string");

            if (source.byteLength === 631) {
              return false;
            }

            return true;
          },
          options: { plugins },
        },
      },
    });

    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(5);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      false
    );
  });

  it("should optimizes all images exclude filtered for #2", async () => {
    const stats = await runWebpack({
      imageminLoaderOptions: {
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            filter: (source, filename) => {
              expect(source).toBeInstanceOf(Buffer);
              expect(typeof filename).toBe("string");

              if (source.byteLength === 631) {
                return false;
              }

              return true;
            },
            options: { plugins },
          },
        ],
      },
    });

    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(5);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      false
    );
  });

  it("should optimizes all images exclude filtered for #3", async () => {
    const stats = await runWebpack({
      imageminLoaderOptions: {
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
            filter: (source, filename) => {
              expect(source).toBeInstanceOf(Buffer);
              expect(typeof filename).toBe("string");

              if (source.byteLength === 631 || /\.png$/.test(filename)) {
                return false;
              }

              return true;
            },
          },
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: { plugins },
          },
        ],
      },
    });

    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(5);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
  });

  it("should generate the new webp image with flat filename", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-1");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            filename: "[name].webp",
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
      output: {
        path: outputDir,
      },
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should generate the new webp image with nested filename", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-2");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            filename: "deep/[path][name].webp",
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
      output: {
        path: outputDir,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "deep/nested/deep/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should generate the new webp image with filename  pointing to other directory", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-3");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            filename: "other/[name].webp",
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
      output: {
        path: outputDir,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "other/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should generate the new webp image when filename is function", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-4");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            filename: () => "other/[name].webp",
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
      output: {
        path: outputDir,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "other/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should minimize image with flat filename", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-5");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./simple.js"),
      imageminLoaderOptions: {
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            filename: "[name][ext]",
          },
        ],
      },
      output: {
        path: outputDir,
      },
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "loader-test.jpg"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/jpeg/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
