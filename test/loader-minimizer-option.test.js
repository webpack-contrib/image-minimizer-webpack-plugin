import { promisify } from "util";
import path from "path";
import imageSize from "image-size";

import ImageMinimizerPlugin from "../src";

import { runWebpack, isOptimized, plugins } from "./helpers";

describe("loader minimizer option", () => {
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
              expect(minifiOptions).toBeUndefined();

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

  it('should work with "sharpMinify" minifier', async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
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

  it('should minimize and resize with "squooshMinify" minifier', async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            resize: {
              enabled: true,
              width: 100,
              height: 50,
            },
            rotate: {
              numRotations: 90,
            },
          },
        },
      },
    });
    const { compilation } = stats;
    const { errors } = compilation;

    const sizeOf = promisify(imageSize);
    const transformedAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.png"
    );
    const dimensions = await sizeOf(transformedAsset);

    expect(dimensions.height).toBe(50);
    expect(dimensions.width).toBe(100);
    expect(errors).toHaveLength(0);
    expect(compilation.getAsset("loader-test.jpg").info.size).toBeLessThan(631);
    expect(compilation.getAsset("loader-test.png").info.size).toBeLessThan(
      71000
    );
  });

  it('should minimize and resize with "sharpMinify" minifier', async () => {
    const stats = await runWebpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            resize: {
              enabled: true,
              width: 100,
              height: 50,
            },
            rotate: {
              numRotations: 90,
            },
          },
        },
      },
    });
    const { compilation } = stats;
    const { errors } = compilation;

    const sizeOf = promisify(imageSize);
    const transformedAsset = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.png"
    );
    const dimensions = await sizeOf(transformedAsset);

    expect(dimensions.height).toBe(50);
    expect(dimensions.width).toBe(100);
    expect(errors).toHaveLength(0);
    expect(compilation.getAsset("loader-test.jpg").info.size).toBeLessThan(631);
    expect(compilation.getAsset("loader-test.png").info.size).toBeLessThan(
      71000
    );
  });
});
