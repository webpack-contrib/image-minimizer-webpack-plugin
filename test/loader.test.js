import fs from "fs";
import path from "path";

import pify from "pify";
import fileType from "file-type";

import { fixturesPath, isOptimized, plugins, runWebpack } from "./helpers";
import ImageMinimizerPlugin from "../src/index.js";

describe("loader", () => {
  it("should optimizes all images", async () => {
    const stats = await runWebpack({
      imageminLoaderOptions: {
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
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-other-imports.js"),
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
      },
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

    // await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
    //   true
    // );
    // await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
    //   true
    // );
    // await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
    //   true
    // );
    // await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
    //   true
    // );
  });

  // TODO: add test for assets/modules
  // TODO: add test for data:
  // TODO: add test for https:
  it("should optimizes and generate images (imageminGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator.js"),
      imageminLoader: true,
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
      },
      output: {
        path: path.resolve(__dirname, "outputs/loader-generator-imagemin"),
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      "outputs",
      "./loader-generator-imagemin/loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });

  it("should optimizes and generate images (squooshGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator.js"),
      imageminLoader: true,
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  lossless: 1,
                },
              },
            },
          },
        ],
      },
      output: {
        path: path.resolve(__dirname, "outputs/loader-generator-squoosh"),
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      "outputs",
      "./loader-generator-squoosh/loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });
});
