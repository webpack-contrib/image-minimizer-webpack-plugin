import ImageMinimizerPlugin from "../src";

import { webpack, isOptimized, fixturesPath } from "./helpers";

describe("loader minify option", () => {
  it('should work with "imagemin" minifier', async () => {
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

  it("should work when minify is custom function", async () => {
    expect.assertions(14);

    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: (data, minifiOptions) => {
          const [[, input]] = Object.entries(data);

          expect(input).toBeDefined();
          expect(minifiOptions).toBeDefined();

          return {
            data: input,
          };
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
    expect.assertions(14);

    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (data, minifiOptions) => {
            const [[, input]] = Object.entries(data);

            expect(input).toBeDefined();
            expect(minifiOptions).toBeDefined();

            return {
              data: input,
            };
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
    expect.assertions(14);

    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: [
          ImageMinimizerPlugin.imageminMinify,
          (data, minifiOptions) => {
            const [[, input]] = Object.entries(data);

            expect("options2" in minifiOptions).toBe(true);

            return {
              data: input,
            };
          },
          (data, minifiOptions) => {
            const [[, input]] = Object.entries(data);

            expect("options3" in minifiOptions).toBe(true);

            return {
              data: input,
            };
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

    expect(errors).toHaveLength(8);
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

  // Todo enable test when "main" section in @squoosh/lib package.json will be fixed
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should work with "squooshMinify" minifier', async () => {
    const stats = await webpack({
      imageminLoader: true,
      imageminLoaderOptions: {
        minify: ImageMinimizerPlugin.squooshMinify,
        minimizerOptions: {
          context: fixturesPath,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(2);
    expect(errors).toHaveLength(0);

    expect(compilation.getAsset("loader-test.jpg").info.size).toBeLessThan(631);
    expect(compilation.getAsset("loader-test.png").info.size).toBeLessThan(
      71000
    );
  });
});
