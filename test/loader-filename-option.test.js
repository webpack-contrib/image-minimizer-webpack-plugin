import path from "path";

import fileType from "file-type";

import { fixturesPath, webpack, clearDirectory } from "./helpers";

import ImageMinimizerPlugin from "../src";

describe('loader "filename" option', () => {
  beforeAll(() => clearDirectory(path.resolve(__dirname, "outputs")));
  afterAll(() => clearDirectory(path.resolve(__dirname, "outputs")));

  it("should emit new transformed to webp asset with flat filename", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-1");
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      output: {
        path: outputDir,
      },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          filename: "[name][ext]",
          deleteOriginalAssets: true,
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should emit new transformed to webp asset with nested filename", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-2");
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      output: {
        path: outputDir,
      },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          filename: "deep/[path][name][ext]",
          deleteOriginalAssets: true,
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "deep/nested/deep/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should emit new transformed to webp asset with filename  pointing to other directory", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-3");
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      output: {
        path: outputDir,
      },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          filename: "other/[name][ext]",
          deleteOriginalAssets: true,
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "other/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should emit new transformed to webp asset with filename when filename is function", async () => {
    const outputDir = path.resolve(__dirname, "outputs", "loader-filename-3");
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-single.js"),
      output: {
        path: outputDir,
      },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          filename: () => "other/[name][ext]",
          deleteOriginalAssets: true,
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const transformedAsset = path.resolve(
      __dirname,
      outputDir,
      "other/loader-test.webp"
    );

    const transformedExt = await fileType.fromFile(transformedAsset);

    expect(/image\/webp/i.test(transformedExt.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
