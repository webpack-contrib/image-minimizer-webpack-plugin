import path from "path";

import fileType from "file-type";

import { fixturesPath, isOptimized, webpack, normalizePath } from "./helpers";

import ImageMinimizerPlugin from "../src";

describe('plugin "deleteOriginal" option', () => {
  it("should transform asset and keep original asset (default behavior)", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.webp")
    );

    const originalAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    const file = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/plugin-test.webp"
    );
    const ext = await fileType.fromFile(file);

    await expect(
      isOptimized("./nested/deep/plugin-test.png", compilation)
    ).resolves.toBe(false);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(originalAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should transform asset and keep original asset when the "deleteOriginal" option is "false"', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          deleteOriginal: false,
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.webp")
    );

    const originalAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    const file = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/plugin-test.webp"
    );
    const ext = await fileType.fromFile(file);

    await expect(
      isOptimized("./nested/deep/plugin-test.png", compilation)
    ).resolves.toBe(false);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(originalAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should transform asset and keep original asset when the "deleteOriginal" option is "true"', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./empty-entry.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          deleteOriginal: true,
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.webp")
    );

    const originalAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    const file = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/plugin-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(originalAssets).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should transform assets to webp using plugin and loader", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-generate-url.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      emitPlugin: true,
      emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;
    const assetsKeys = Object.keys(assets).map((asset) => normalizePath(asset));

    [
      "nested/deep/loader-test.webp?foo=bar",
      "./nested/deep/plugin-test.png",
      "./nested/deep/plugin-test.webp",
    ].forEach((asset) => {
      expect(assetsKeys).toContain(asset);
    });

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should transform asset and remove original asset when the "deleteOriginal" option is "true"', async () => {
    const multiStats = await webpack([
      {
        entry: path.join(fixturesPath, "./empty-entry.js"),
        output: {
          path: path.resolve(__dirname, "outputs"),
        },
        emitPlugin: true,
        emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
        imageminPluginOptions: {
          minify: ImageMinimizerPlugin.imageminGenerate,
          minimizerOptions: {
            deleteOriginal: true,
            plugins: ["imagemin-webp"],
          },
        },
      },
      {
        entry: path.join(fixturesPath, "./empty-entry.js"),
        output: {
          path: path.resolve(__dirname, "outputs"),
        },
        emitPlugin: true,
        emitPluginOptions: { fileNames: ["./nested/deep/plugin-test.png"] },
        imageminPluginOptions: {
          minimizerOptions: {
            plugins: ["pngquant"],
          },
        },
      },
    ]);

    expect(multiStats.stats).toHaveLength(2);

    const [{ compilation }, { compilation: secondCompilation }] =
      multiStats.stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.webp")
    );

    const originalAssets = Object.keys(assets).filter((asset) =>
      asset.includes("./nested/deep/plugin-test.png")
    );

    const file = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/plugin-test.webp"
    );
    const ext = await fileType.fromFile(file);

    const { warnings: secondWarnings, errors: secondErrors } =
      secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    await expect(
      isOptimized("./nested/deep/plugin-test.png", secondCompilation)
    ).resolves.toBe(true);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(originalAssets).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
