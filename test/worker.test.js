import fs from "fs";
import path from "path";

import imagemin from "imagemin";
import { ImagePool } from "@squoosh/lib";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminWebp from "imagemin-webp";
import imageminSvgo from "imagemin-svgo";
import pify from "pify";

import worker from "../src/worker";

import {
  imageminMinify,
  imageminGenerate,
  squooshMinify,
  squooshGenerate,
} from "../src/utils.js";

function isPromise(obj) {
  return (
    Boolean(obj) &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

describe("minify", () => {
  it("minify should be is function", () =>
    expect(typeof worker === "function").toBe(true));

  it("should return `Promise`", () =>
    expect(
      isPromise(
        worker({
          minify: imageminMinify,
          minimizerOptions: { plugins: ["mozjpeg"] },
        })
      )
    ).toBe(true));

  it("should optimize", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker({
      minify: imageminMinify,
      input,
      filename: path.relative(process.cwd(), filename),
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
      name: "preset-default",
      params: {
        overrides: {
          // customize plugin options
          addAttributesToSVGElement: {
            attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
          },
        },
      },
    };

    const filename = path.resolve(
      __dirname,
      "./fixtures/large-after-optimization.svg"
    );
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker([{}]);

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
    const result = await worker({ minify: imageminMinify, input, filename });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should throw error on empty `imagemin.plugins` options", async () => {
    const input = Buffer.from("Foo");
    const filename = path.resolve("foo.png");
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
      minimizerOptions: { plugins: [] },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should throw error on invalid `imagemin.plugins` options", async () => {
    const input = Buffer.from("Foo");
    const filename = path.resolve("foo.png");
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
      minimizerOptions: { plugins: false },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should throw error on unknown plugin (configuration using `string`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
      minimizerOptions: {
        plugins: ["imagemin-mozjpeg", "unknown"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result.filename).toBe(filename);
  });

  it("should throw error on unknown plugin (starting with `imagemin`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
      minimizerOptions: {
        plugins: ["imagemin-unknown"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result.filename).toBe(filename);
    expect(result.data.equals(input)).toBe(true);
  });

  it("should return original content and emit a error on invalid content (`String`)", async () => {
    const input = "Foo";
    const result = await worker({
      minify: imageminMinify,
      input,
      filename: "foo.jpg",
      minimizerOptions: { plugins: ["mozjpeg"] },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(2);
    expect(result.data).toBe(input);
  });

  it("should optimize (configuration using `function`)", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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

  it("should optimize and throw warning on using `Function` configuration", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
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
      name: "preset-default",
      params: {
        overrides: {
          // customize plugin options
          cleanupIDs: {
            prefix: "qwerty",
          },
        },
      },
    };

    const filename = path.resolve(__dirname, "./fixtures/svg-with-id.svg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
      minimizerOptions: { plugins: [["svgo", svgoOptions]] },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should return two errors", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: [
        (original) => ({
          data: Buffer.from("test"),
          errors: [...original.errors, new Error("fail")],
        }),
        (original) => ({
          data: Buffer.from("test"),
          errors: [...original.errors, new Error("fail")],
        }),
      ],
      input,
      filename,
    });

    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].toString()).toMatch(/Error: fail/);
    expect(result.errors[1].toString()).toMatch(/Error: fail/);
  });

  it("should work with 'imageminMinify'", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminMinify,
      input,
      filename,
      minimizerOptions: {
        plugins: ["imagemin-mozjpeg"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  it("should work with 'imageminGenerate'", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: imageminGenerate,
      input,
      filename,
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

  it("should work with 'squooshMinify'", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: squooshMinify,
      input,
      filename,
      minimizerOptions: {
        encodeOptions: {
          mozjpeg: {
            quality: 90,
          },
        },
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const imagePool = new ImagePool(1);
    const image = imagePool.ingestImage(new Uint8Array(input));

    await image.encode({
      mozjpeg: {
        quality: 90,
      },
    });

    await imagePool.close();

    const { binary } = await image.encodedWith.mozjpeg;

    expect(result.data.equals(binary)).toBe(true);
  });

  it("should work with 'squooshGenerate'", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const result = await worker({
      minify: squooshGenerate,
      input,
      filename,
      minimizerOptions: {
        encodeOptions: {
          webp: {
            quality: 90,
          },
        },
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const imagePool = new ImagePool(1);
    const image = imagePool.ingestImage(new Uint8Array(input));

    await image.encode({
      webp: {
        quality: 90,
      },
    });

    await imagePool.close();

    const { binary } = await image.encodedWith.webp;

    expect(result.data.equals(binary)).toBe(true);
  });
});
