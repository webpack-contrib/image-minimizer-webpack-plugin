import path from "path";

import fileType from "file-type";

import { fixturesPath, runWebpack, clearDirectory } from "./helpers";

describe.skip('loader "deleteOriginalAssets" option', () => {
  it("should transform asset and keep original asset (default behavior)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      imageminPluginOptions: {
        filename: "[path][name].webp",
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const originalAsset = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/loader-test.jpg"
    );
    const transformedAsset = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/loader-test.webp"
    );
    const originalExt = await fileType.fromFile(originalAsset);
    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/jpeg/i.test(originalExt.mime)).toBe(true);
    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('should transform asset and keep original asset when the "deleteOriginalAssets" option is "false"', async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      imageminPluginOptions: {
        deleteOriginalAssets: false,
        filename: "[path][name].webp",
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const originalAsset = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/loader-test.jpg"
    );
    const transformedAsset = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/loader-test.webp"
    );
    const originalExt = await fileType.fromFile(originalAsset);
    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/jpeg/i.test(originalExt.mime)).toBe(true);
    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  // TODO remove original asset
  it('should transform asset and remove original asset when the "deleteOriginalAssets" option is "true"', async () => {
    const outputDir = path.resolve(__dirname, "outputs", "DOA");

    clearDirectory(outputDir);

    const stats = await runWebpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      output: {
        path: outputDir,
      },
      imageminPluginOptions: {
        deleteOriginalAssets: true,
        filename: "[path][name].webp",
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const originalAsset = path.resolve(
      outputDir,
      "./nested/deep/loader-test.jpg"
    );
    const transformedAsset = path.resolve(
      outputDir,
      "./nested/deep/loader-test.webp"
    );
    const originalExt = await fileType.fromFile(originalAsset);
    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/jpeg/i.test(originalExt.mime)).toBe(true);
    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
