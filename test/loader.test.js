import fs from "fs";
import path from "path";

import pify from "pify";
import fileType from "file-type";

import ImageMinimizerPlugin from "../src";

import { fixturesPath, isOptimized, webpack } from "./helpers";

describe("loader", () => {
  it("should optimizes all images", async () => {
    const stats = await webpack({ imageminLoader: true });
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

  it("should optimizes all images and don't break non images", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-other-imports.js"),
      imageminLoader: true,
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(7);

    const { path: outputPath } = compilation.options.output;

    const txtBuffer = await pify(fs.readFile)(
      path.join(outputPath, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(outputPath, "loader-test.css")
    );

    expect(cssBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe(
      "a {\n  color: red;\n}\n"
    );

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

  it("should transform image to webp using `require`", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-generate-require.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const file = path.resolve(
      __dirname,
      "outputs",
      "./nested/deep/loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    // TODO add test on asset name and check `?foo=bar` is included

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should transform image to webp using `import`", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-generate-import.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const file = path.resolve(
        __dirname,
        "outputs",
        "./nested/deep/loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    // TODO add test on asset name and check `?foo=bar` is included

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should transform image to webp using `new URL(...)`", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./loader-generate-url.js"),
      output: {
        path: path.resolve(__dirname, "outputs"),
      },
      fileLoaderOff: true,
      imageminPluginOptions: {
        minify: ImageMinimizerPlugin.imageminGenerate,
        minimizerOptions: {
          plugins: ["imagemin-webp"],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;
    
    // TODO add test on asset name and check `?foo=bar` is included

    const file = path.resolve(
        __dirname,
        "outputs",
        "./nested/deep/loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
