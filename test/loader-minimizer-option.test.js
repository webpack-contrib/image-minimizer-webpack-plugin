import ImageMinimizerPlugin from "../src";

import { runWebpack, isOptimized } from "./helpers";

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
});
