import path from "path";

import { fixturesPath, runWebpack, plugins } from "./helpers";
import ImageMinimizerPlugin from "../src/index.js";

describe('plugin "deleteOriginalAssets" option', () => {
  it("should minimize asset and delete original asset (default behavior)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "[path]minimizer-[name][ext]",
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;
    const newAsset = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/minimizer-plugin-test.png")
    );
    const originalAsset = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    expect(newAsset).toHaveLength(1);
    expect(originalAsset).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should minimize asset and delete original asset when the name is the same (default behavior)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;
    const newAsset = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    expect(newAsset).toHaveLength(1);
    expect(Object.keys(assets)).toHaveLength(2);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should minimize asset and delete original asset and keep original asset when the "deleteOriginalAssets" option is "false"', async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        deleteOriginalAssets: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "[path]minimizer-[name][ext]",
          options: { plugins: ["imagemin-pngquant"] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;
    const newAsset = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/minimizer-plugin-test.png")
    );
    const originalAsset = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    expect(newAsset).toHaveLength(1);
    expect(originalAsset).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should transform asset and keep original asset when the "deleteOriginalAssets" option is "true"', async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        deleteOriginalAssets: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          filename: "[path]minimizer-[name][ext]",
          options: { plugins: ["imagemin-pngquant"] },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;
    const newAsset = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/minimizer-plugin-test.png")
    );
    const originalAsset = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    expect(newAsset).toHaveLength(1);
    expect(originalAsset).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should transform asset and keep original asset when the "deleteOriginalAssets" option is "true" (multi compiler mode)', async () => {
    const multiStats = await runWebpack([
      {
        entry: path.join(fixturesPath, "./empty-entry.js"),
        emitPlugin: true,
        emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
        imageminPluginOptions: {
          deleteOriginalAssets: true,
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            filename: "[path]one-minimized-[name][ext]",
            options: { plugins },
          },
        },
      },
      {
        entry: path.join(fixturesPath, "./empty-entry.js"),
        emitPlugin: true,
        emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
        imageminPluginOptions: {
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            filename: "[path]two-minimized-[name][ext]",
            options: { plugins },
          },
        },
      },
    ]);

    expect(multiStats.stats).toHaveLength(2);

    const [{ compilation }, { compilation: secondCompilation }] =
      multiStats.stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/one-minimized-plugin-test.png")
    );

    const originalAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    const { warnings: secondWarnings, errors: secondErrors } =
      secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(transformedAssets).toHaveLength(1);
    expect(originalAssets).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
