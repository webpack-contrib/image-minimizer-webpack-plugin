import path from "path";

import { fixturesPath, isOptimized, plugins, runWebpack } from "./helpers";
import ImageMinimizerPlugin from "../src/index.js";

describe("plugin severityError option", () => {
  it("should optimizes images and throws error on corrupted images using `plugin.severityError` option with `error` value (by plugin)", async () => {
    const stats = await runWebpack({
      emitPluginOptions: {
        fileNames: ["test-corrupted.jpg", "plugin-test.png"],
      },
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPluginOptions: {
        severityError: "error",
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized("plugin-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes images and not throws error or warnings on corrupted images using `plugin.severityError` option with `off` value (by plugin)", async () => {
    const stats = await runWebpack({
      emitPluginOptions: {
        fileNames: ["test-corrupted.jpg", "plugin-test.png"],
      },
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPluginOptions: {
        severityError: "off",
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("plugin-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes images and throws warnings on corrupted images using `plugin.severityError` option with `warning` value (by plugin)", async () => {
    const stats = await runWebpack({
      emitPluginOptions: {
        fileNames: ["test-corrupted.jpg", "plugin-test.png"],
      },
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPluginOptions: {
        severityError: "warning",
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized("plugin-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes images and throws error on corrupted images when `plugin.severityError` option not specify (by plugin)", async () => {
    const stats = await runWebpack({
      emitPluginOptions: {
        fileNames: ["test-corrupted.jpg", "plugin-test.png"],
      },
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE|Command failed with ENOTCONN)/
    );

    await expect(isOptimized("plugin-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes images and throws errors on corrupted images using `plugin.severityError` option with `error` value (by loader)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminPluginOptions: {
        severityError: "error",
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(2);

    // From loader
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    // From plugin
    expect(errors[1].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws errors on corrupted images when `plugin.severityError` option not specify (by loader)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(2);

    // From loader
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    // From plugin
    expect(errors[1].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes images and throws errors on corrupted images using `plugin.severityError` option with `off` value (by loader)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminPluginOptions: {
        severityError: "off",
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });
});
