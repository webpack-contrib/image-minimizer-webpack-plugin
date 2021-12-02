import path from "path";
import { promisify } from "util";
import fileType from "file-type";
import imageSize from "image-size";
import ImageMinimizerPlugin from "../src";

import { runWebpack, fixturesPath } from "./helpers";

describe("loader generator option", () => {
  it("should work", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-1");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
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
      output: {
        path: outputDir,
      },
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "./nested/deep/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should throw error on duplicate presets", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-2");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
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
      output: {
        path: outputDir,
      },
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /Found several identical pereset names, the 'preset' option should be unique/
    );
  });

  it("should throw error on not found preset", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-3");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webpz",
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
      output: {
        path: outputDir,
      },
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /Can't find 'webp' preset in the 'generator' option/
    );
  });

  it("should generate the new webp image with flat filename", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-4");
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
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-5");
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
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-6");
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
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-7");
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
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-8");
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

  it("should generate and resize", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-1");
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              resize: {
                enabled: true,
                width: 100,
                height: 50,
              },
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
      "./nested/deep/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);
    const sizeOf = promisify(imageSize);
    const dimensions = await sizeOf(transformedAsset);

    expect(dimensions.height).toBe(50);
    expect(dimensions.width).toBe(100);
    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
