import fs from "fs";
import path from "path";

import pify from "pify";
import fileType from "file-type";

import { fixturesPath, isOptimized, plugins, runWebpack } from "./helpers";
import ImageMinimizerPlugin from "../src/index.js";

jest.setTimeout(20000);

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

  it("should optimizes all images and don't break non images ('imageminMinify')", async () => {
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

    const txtBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.css")
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

  it("should generate all images and don't break non images ('imageminGenerate')", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-other-imports-1.js"),
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: { plugins: ["imagemin-webp"] },
          },
        ],
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
    expect(Object.keys(assets)).toHaveLength(8);
    expect(Object.keys(assets)).toContain("loader-test.webp");

    const txtBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.css")
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

  it("should optimizes all images and don't break non images ('squooshMinify')", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-other-imports.js"),
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            mozjpeg: {
              quality: 40,
            },
            oxipng: {
              quality: 40,
            },
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(7);

    const txtBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.css")
    );

    expect(cssBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe(
      "a {\n  color: red;\n}\n"
    );

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

  it("should generate all images and don't break non images ('squooshGenerate')", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-other-imports-1.js"),
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 90,
                },
              },
            },
          },
        ],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 40,
              },
              oxipng: {
                quality: 40,
              },
            },
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(8);
    expect(Object.keys(assets)).toContain("loader-test.webp");

    const txtBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.css")
    );

    expect(cssBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe(
      "a {\n  color: red;\n}\n"
    );

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

  it("should optimizes all images and don't break non images ('sharpMinify')", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-other-imports.js"),
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(7);

    const txtBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.css")
    );

    expect(cssBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe(
      "a {\n  color: red;\n}\n"
    );

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

  it("should generate all images and don't break non images ('sharpGenerate')", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "loader-other-imports-1.js"),
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i,
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 90,
                },
              },
            },
          },
        ],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: {
                quality: 40,
              },
              png: {
                quality: 40,
              },
            },
          },
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(8);
    expect(Object.keys(assets)).toContain("loader-test.webp");

    const txtBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(compilation.options.output.path, "loader-test.css")
    );

    expect(cssBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe(
      "a {\n  color: red;\n}\n"
    );

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
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });

  it("should generate and minimize images (imageminGenerate) using absolute URLs", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator-asset-modules.js"),
      fileLoaderOff: true,
      assetResource: true,
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {},
              },
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "./loader-test.webp"
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
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });

  it("should optimizes and generate images (sharpGenerate)", async () => {
    const stats = await runWebpack({
      entry: path.join(fixturesPath, "generator.js"),
      imageminLoader: true,
      imageminLoaderOptions: {
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: {
                  lossless: true,
                },
              },
            },
          },
        ],
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const file = path.resolve(
      __dirname,
      compilation.options.output.path,
      "loader-test.webp"
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
  });

  it("should throw an error on empty minimizer", async () => {
    const stats = await runWebpack({
      imageminLoaderOptions: {
        minimizer: undefined,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(4);
    expect(errors[0].message).toMatch(
      /Not configured 'minimizer' or 'generator' options, please setup them/
    );
  });

  it("should throw an error on empty generator", async () => {
    const stats = await runWebpack({
      imageminLoaderOptions: {
        generator: undefined,
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(4);
    expect(errors[0].message).toMatch(
      /Not configured 'minimizer' or 'generator' options, please setup them/
    );
  });
});
