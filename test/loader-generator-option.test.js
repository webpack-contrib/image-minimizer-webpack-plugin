import path from "path";
import { promisify } from "util";
import fileType from "file-type";
import imageSize from "image-size";
import ImageMinimizerPlugin from "../src";

import { runWebpack, fixturesPath } from "./helpers";

jest.setTimeout(10000);

describe("loader generator option", () => {
  it("should work", async () => {
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
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./nested/deep/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should throw error on duplicate presets", async () => {
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
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /Can't find 'webp' preset in the 'generator' option/
    );
  });

  it("should generate the new webp image with other name using old loader approach", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      name: "foo-[name].[ext]",
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
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
      "foo-loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should generate the new webp image with other name using asset modules name", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      fileLoaderOff: true,
      assetResource: true,
      name: "foo-[name][ext]",
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
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
      "foo-loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should generate and resize (squooshGenerate)", async () => {
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
              rotate: {
                numRotations: 90,
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
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
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

  it("should generate and resize (sharpGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              resize: {
                enabled: true,
                width: 100,
                height: 50,
              },
              rotate: {
                numRotations: 90,
              },
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

    const transformedAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
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
