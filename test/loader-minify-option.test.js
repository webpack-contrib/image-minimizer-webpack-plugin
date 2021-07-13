import ImageMinimizerPlugin from "../src";

import { webpack, isOptimized } from "./helpers";

describe("loader minify option", () => {
  it('should work with "imageminMinify" minifier', async () => {
    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: ImageMinimizerPlugin.imageminMinify,
        minimizerOptions: {
          plugins: ["gifsicle", "mozjpeg", "pngquant", "svgo"],
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

  it('should work with "squooshMinify" minifier', async () => {
    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
        minimizerOptions: {
          encodeOptions: {
            mozjpeg: {},
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(2);
    expect(errors).toHaveLength(0);

    expect(compilation.getAsset("loader-test.gif").info.size).toBeLessThan(
      1117
    );
    expect(compilation.getAsset("loader-test.jpg").info.size).toBeLessThan(632);
    expect(compilation.getAsset("loader-test.png").info.size).toBeLessThan(
      71835
    );
    expect(compilation.getAsset("loader-test.svg").info.size).toBeLessThan(200);
  });

  it("should work when minify is custom function", async () => {
    expect.assertions(30);

    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: (original, minifiOptions) => {
          expect(original.data).toBeDefined();
          expect(original.filename).toBeDefined();
          expect(original.info).toBeDefined();
          expect(original.errors).toBeDefined();
          expect(original.warnings).toBeDefined();
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

  it("should work if minify is array && minimizerOptions is object", async () => {
    expect.assertions(30);

    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (original, minifiOptions) => {
            expect(original.data).toBeDefined();
            expect(original.filename).toBeDefined();
            expect(original.info).toBeDefined();
            expect(original.errors).toBeDefined();
            expect(original.warnings).toBeDefined();
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

  it("should work if minify is array && minimizerOptions is array", async () => {
    expect.assertions(62);

    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (original, minifiOptions) => {
            expect(original.data).toBeDefined();
            expect(original.filename).toBeDefined();
            expect(original.info).toBeDefined();
            expect(original.errors).toBeDefined();
            expect(original.warnings).toBeDefined();
            expect(minifiOptions).toBeDefined();

            expect("options2" in minifiOptions).toBe(true);

            return original;
          },
          (original, minifiOptions) => {
            expect(original.data).toBeDefined();
            expect(original.filename).toBeDefined();
            expect(original.info).toBeDefined();
            expect(original.errors).toBeDefined();
            expect(original.warnings).toBeDefined();
            expect(minifiOptions).toBeDefined();

            expect("options3" in minifiOptions).toBe(true);

            return original;
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

  it("should emit errors", async () => {
    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: () => {
          throw new Error("test error");
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
});
