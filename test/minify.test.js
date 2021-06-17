import fs from "fs";
import path from "path";

import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminSvgo from "imagemin-svgo";
import imageminWebp from "imagemin-webp";
import pify from "pify";
import fileType from "file-type";

// eslint-disable-next-line import/no-extraneous-dependencies
import { extendDefaultPlugins } from "svgo";

import minify from "../src/minify";

import ImageMinimizerPlugin from "../src";

function isPromise(obj) {
  return (
    Boolean(obj) &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

const getPathWithInfoFn = ({ filename }) => ({ path: filename });

describe("minify", () => {
  it("minify should be is function", () =>
    expect(typeof minify === "function").toBe(true));

  it("should return `Promise`", () =>
    expect(
      isPromise(
        minify(
          [
            {
              minify: ImageMinimizerPlugin.imageminMinify,
              input: Buffer.from("Foo"),
            },
          ],
          {
            minify: ImageMinimizerPlugin.imageminMinify,
            minimizerOptions: { plugins: ["mozjpeg"] },
          }
        )
      )
    ).toBe(true));

  it("should optimize", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["mozjpeg"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize (relative filename)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename: path.relative(process.cwd(), filename),
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["mozjpeg"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(path.relative(process.cwd(), filename));

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should return optimized image even when optimized image large then original", async () => {
    const svgoOptions = {
      plugins: extendDefaultPlugins([
        {
          name: "addAttributesToSVGElement",
          params: {
            attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
          },
        },
      ]),
    };

    const filename = path.resolve(
      __dirname,
      "./fixtures/large-after-optimization.svg"
    );
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: { plugins: [["svgo", svgoOptions]] },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should throw error on empty", async () => {
    const [result] = await minify([{}]);

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(/Empty input/);
    expect(result.filename).toBeUndefined();
    expect(result.input).toBeUndefined();
    expect(result.data).toBeUndefined();
  });

  it("should throw error on empty `imagemin` options", async () => {
    const input = Buffer.from("Foo");
    const filename = path.resolve("foo.png");
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should throw error on empty `imagemin.plugins` options", async () => {
    const input = Buffer.from("Foo");
    const filename = path.resolve("foo.png");
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: { plugins: [] },
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should throw error on invalid `imagemin.plugins` options", async () => {
    const input = Buffer.from("Foo");
    const filename = path.resolve("foo.png");
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: { plugins: false },
    });

    expect(result.errors).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result.errors[0].toString()).toMatch(
      "TypeError: Found non-callable @@iterator"
    );
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should return original content and emit a error on invalid content (`String`)", async () => {
    const input = "Foo";
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename: "foo.jpg",
      getPathWithInfoFn,
      minimizerOptions: { plugins: ["mozjpeg"] },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.data).toBe(input);
  });

  it("should optimize (configuration using `function`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["mozjpeg"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize (configuration using `string`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["mozjpeg"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize (configuration using `array`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: [["mozjpeg", { quality: 0 }]],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg({ quality: 0 })],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize (configuration using `array` without options)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: [["mozjpeg"]],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize (configuration using `string` with full name)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["imagemin-mozjpeg"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize (configuration using `array` with full name)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: [["imagemin-mozjpeg", { quality: 0 }]],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg({ quality: 0 })],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize (configuration using `array` with full name and without options)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: [["imagemin-mozjpeg"]],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should throw error on empty `imagemin` options (configuration using `string` and starting with `imagemin`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["imagemin-unknown"],
      },
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should optimize and throw error on unknown plugin (configuration using `string`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["imagemin-mozjpeg", "unknown"],
      },
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result.errors).toHaveLength(0);
    expect(result.filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should optimize and throw warning on using `Function` configuration", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: [imageminMozjpeg()],
      },
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(/Invalid plugin configuration/);
    expect(result.warnings).toHaveLength(0);
    expect(result.filename).toBe(filename);
  });

  it("should support svgo options", async () => {
    const svgoOptions = {
      plugins: extendDefaultPlugins([
        {
          name: "cleanupIDs",
          params: {
            prefix: "qwerty",
          },
        },
      ]),
    };

    const filename = path.resolve(__dirname, "./fixtures/svg-with-id.svg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminMinify,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: { plugins: [["svgo", svgoOptions]] },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should throw two errors", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: [
        () => ({ errors: [new Error("fail")] }),
        () => ({ errors: [new Error("fail")] }),
      ],
      input,
      filename,
      getPathWithInfoFn,
    });

    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].toString()).toMatch(/Error: fail/);
    expect(result.errors[1].toString()).toMatch(/Error: fail/);
    expect(result.filename).toBe(filename);
  });

  it("should transform with ImageMinimizerPlugin.imageminGenerate", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [, result] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["imagemin-webp"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminWebp()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should emit warning on imagemin unknown plugin", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["imagemin-unknown"],
      },
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(/Error: Unknown plugin/);
    expect(result.errors).toHaveLength(0);
  });

  it("should emit warning on imagemin when no plugins", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {},
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(/Error: No plugins found/);
    expect(result.errors).toHaveLength(0);
  });

  it("should emit error when imagemin.buffer has error", async () => {
    const imageminBufferSpy = jest
      .spyOn(imagemin, "buffer")
      .mockImplementation(() => {
        throw new Error("test error");
      });

    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        deleteOriginalAssets: true,
        plugins: ["imagemin-avif", "imagemin-webp"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].toString()).toMatch(/Error: test error/);

    imageminBufferSpy.mockRestore();
  });

  it("should transform to webp and emit one error when imagemin.buffer has error", async () => {
    const imageminSpy = jest
      .spyOn(imagemin, "buffer")
      .mockImplementationOnce(() => {
        throw new Error("test error");
      });

    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [inputAsset, resultWebp] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      getPathWithInfoFn,
      minimizerOptions: {
        plugins: ["imagemin-avif", "imagemin-webp"],
      },
    });

    const ext = await fileType.fromBuffer(resultWebp.data);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(inputAsset.warnings).toHaveLength(0);
    expect(inputAsset.errors).toHaveLength(1);
    expect(inputAsset.errors[0].toString()).toMatch(/Error: test error/);

    imageminSpy.mockRestore();
  });
});
