import path from "path";

import ImageMinimizerPlugin from "../src";
import { fixturesPath, isOptimized, plugins, runWebpack } from "./helpers";

describe("loader severityError option", () => {
  it("should throws error on corrupted images using `severityError` option with `error` value", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        severityError: "error",
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins,
          },
        },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using `severityError` option with `warning` value", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins,
          },
        },
        severityError: "warning",
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using `severityError` option with `off` value", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins,
          },
        },
        severityError: "off",
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using mode `production` and `severityError` option not specify value", async () => {
    const stats = await runWebpack({
      mode: "production",
      optimization: {
        emitOnErrors: true,
      },
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins,
          },
        },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });
});
