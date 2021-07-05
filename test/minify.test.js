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
      minimizerOptions: { plugins: [["svgo", svgoOptions]] },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result.data.equals(optimizedSource)).toBe(true);
  });

  const squooshGenerateOptions = {
    encodeOptions: {
      webp: {},
      oxipng: {},
    },
  };

  [
    {
      targetsResults: ["jpg", "webp", "png"],
      data: [
        [ImageMinimizerPlugin.squooshGenerate, squooshGenerateOptions],
        [
          (original) => {
            expect(original.filename.endsWith("png")).toBe(true);

            return original;
          },
          {
            filter: (entry) => entry.filename.endsWith("png"),
          },
        ],
      ],
    },
    // {
    //   targetsResults: ["jpg", "webp", "png"],
    //   data: [
    //     [ImageMinimizerPlugin.squooshGenerate, squooshGenerateOptions],
    //     [ImageMinimizerPlugin.squooshMinify, {}],
    //   ],
    // },
    // {
    //   targetsResults: ["jpg", "webp", "png"],
    //   data: [
    //     [ImageMinimizerPlugin.squooshMinify, {}],
    //     [ImageMinimizerPlugin.squooshGenerate, squooshGenerateOptions],
    //   ],
    // },
    // {
    //   targetsResults: ["jpg"],
    //   data: [
    //     [ImageMinimizerPlugin.squooshMinify, {}],
    //     [ImageMinimizerPlugin.squooshMinify, {}],
    //   ],
    // },
    // // Todo check this case
    // // {
    // //   targetsResults: ["jpg", "webp", "png"],
    // //   data: [
    // //     [
    // //       ImageMinimizerPlugin.squooshGenerate,
    // //       { encodeOptions: { oxipng: {} } },
    // //     ],
    // //     [ImageMinimizerPlugin.squooshGenerate, { encodeOptions: { webp: {} } }],
    // //   ],
    // // },
    // {
    //   targetsResults: ["jpg", "jpg", "webp", "avif"],
    //   data: [
    //     [
    //       ImageMinimizerPlugin.imageminGenerate,
    //       {
    //         plugins: ["imagemin-webp", "imagemin-avif"],
    //       },
    //     ],
    //     [
    //       ImageMinimizerPlugin.imageminMinify,
    //       {
    //         plugins: ["imagemin-mozjpeg"],
    //       },
    //     ],
    //   ],
    // },
    // {
    //   targetsResults: ["jpg", "jpg", "webp", "avif"],
    //   data: [
    //     [
    //       ImageMinimizerPlugin.imageminMinify,
    //       {
    //         plugins: ["imagemin-mozjpeg"],
    //       },
    //     ],
    //     [
    //       ImageMinimizerPlugin.imageminGenerate,
    //       {
    //         plugins: ["imagemin-webp", "imagemin-avif"],
    //       },
    //     ],
    //   ],
    // },
    // // Todo check this case
    // // {
    // //   targetsResults: ["jpg", "webp", "avif"],
    // //   data: [
    // //     [ImageMinimizerPlugin.imageminGenerate, {
    // //       plugins: ["imagemin-webp"]
    // //     }],
    // //     [ImageMinimizerPlugin.imageminGenerate, {
    // //       plugins: ["imagemin-avif"]
    // //     }],
    // //   ],
    // // },
    // {
    //   targetsResults: ["jpg"],
    //   data: [
    //     [
    //       ImageMinimizerPlugin.imageminMinify,
    //       {
    //         plugins: ["imagemin-mozjpeg"],
    //       },
    //     ],
    //     [
    //       ImageMinimizerPlugin.imageminMinify,
    //       {
    //         plugins: ["imagemin-mozjpeg"],
    //       },
    //     ],
    //   ],
    // },
    // {
    //   targetsResults: ["jpg", "png"],
    //   data: [
    //     [
    //       ImageMinimizerPlugin.squooshGenerate,
    //       { encodeOptions: { oxipng: {} } },
    //     ],
    //     [
    //       ImageMinimizerPlugin.imageminMinify,
    //       {
    //         plugins: ["imagemin-mozjpeg", "imagemin-pngquant"],
    //       },
    //     ],
    //   ],
    // },
    // {
    //   targetsResults: ["jpg", "jpg", "webp"],
    //   data: [
    //     [
    //       ImageMinimizerPlugin.imageminGenerate,
    //       {
    //         plugins: ["imagemin-webp"],
    //       },
    //     ],
    //     [ImageMinimizerPlugin.squooshMinify, {}],
    //   ],
    // },
  ].forEach((testCase) => {
    const { targetsResults, data } = testCase;
    const [[firstFn, firstOptions], [secondtFn, secondtOptions]] = data;

    it(`should work with ${firstFn.name}/${JSON.stringify(firstOptions)} + ${
      secondtFn.name
    }/${JSON.stringify(secondtOptions)}`, async () => {
      const filename = path.resolve(__dirname, "./fixtures/plugin-test.jpg");
      const input = await pify(fs.readFile)(filename);
      const results = await minify({
        input,
        filename,
        minify: [firstFn, secondtFn],
        minimizerOptions: [firstOptions, secondtOptions],
      });

      const targets = [...targetsResults];
      const tasks = [];

      results.forEach((result) => {
        tasks.push(
          (async () => {
            const { ext } = await fileType.fromBuffer(result.data);

            expect(targets).toContain(ext);

            targets.splice(targets.indexOf(ext), 1);

            expect(result.filename.endsWith(ext)).toBe(true);
            expect(result.warnings).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
          })()
        );
      });

      await Promise.all(tasks);

      expect(targets).toHaveLength(0);
    });
  });

  [
    {
      targetsResults: ["jpg"],
      data: [
        ImageMinimizerPlugin.squooshMinify,
        {
          encodeOptions: {},
        },
      ],
    },
    {
      targetsResults: ["jpg", "webp", "png"],
      data: [
        ImageMinimizerPlugin.squooshGenerate,
        {
          encodeOptions: { oxipng: {}, webp: {} },
        },
      ],
    },
    {
      targetsResults: ["webp", "png"],
      data: [
        ImageMinimizerPlugin.squooshGenerate,
        {
          deleteOriginal: true,
          encodeOptions: { oxipng: {}, webp: {} },
        },
      ],
    },
    {
      targetsResults: ["jpg"],
      data: [
        ImageMinimizerPlugin.squooshGenerate,
        {
          filter: () => false,
          encodeOptions: { oxipng: {}, webp: {} },
        },
      ],
    },
  ].forEach((testCase) => {
    const { targetsResults, data } = testCase;
    const [minifyFn, minifyOptions] = data;

    it(`should work with ${minifyFn.name} + ${JSON.stringify(
      minifyOptions
    )}`, async () => {
      const filename = path.resolve(__dirname, "./fixtures/plugin-test.jpg");
      const input = await pify(fs.readFile)(filename);
      const results = await minify({
        input,
        filename,
        minify: minifyFn,
        minimizerOptions: minifyOptions,
      });

      const targets = [...targetsResults];
      const tasks = [];

      results.forEach((result) => {
        tasks.push(
          (async () => {
            const { ext } = await fileType.fromBuffer(result.data);

            expect(targets).toContain(ext);

            targets.splice(targets.indexOf(ext), 1);

            expect(result.filename.endsWith(ext)).toBe(true);
            expect(result.warnings).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
          })()
        );
      });

      await Promise.all(tasks);

      expect(targets).toHaveLength(0);
    });
  });

  it("should throw two errors", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: [
        (original) => {
          original.errors.push(new Error("fail"));

          return original;
        },
        (original) => {
          original.errors.push(new Error("fail"));

          return original;
        },
      ],
      input,
      filename,
    });

    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].toString()).toMatch(/Error: fail/);
    expect(result.errors[1].toString()).toMatch(/Error: fail/);
    expect(result.filename).toBe(filename);
  });

  it("should emit error when imagemin.buffer has error", async () => {
    const imageminBufferSpy = jest
      .spyOn(imagemin, "buffer")
      .mockImplementation(() => {
        throw new Error("test error");
      });

    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [, avif, webp] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      minimizerOptions: {
        deleteOriginalAssets: true,
        plugins: ["imagemin-avif", "imagemin-webp"],
      },
    });

    expect(avif.warnings).toHaveLength(0);
    expect(avif.errors).toHaveLength(1);
    expect(avif.errors[0].toString()).toMatch(/Error: test error/);

    expect(webp.warnings).toHaveLength(0);
    expect(webp.errors).toHaveLength(1);
    expect(webp.errors[0].toString()).toMatch(/Error: test error/);

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
    const [, avif, webp] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      minimizerOptions: {
        plugins: ["imagemin-avif", "imagemin-webp"],
      },
    });

    const ext = await fileType.fromBuffer(webp.data);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(avif.warnings).toHaveLength(0);
    expect(avif.errors).toHaveLength(1);
    expect(avif.errors[0].toString()).toMatch(/Error: test error/);

    imageminSpy.mockRestore();
  });

  it("should generate 'webp' using 'imagemin-webp'", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [, result] = await minify({
      minify: ImageMinimizerPlugin.imageminGenerate,
      input,
      filename,
      minimizerOptions: {
        plugins: ["imagemin-webp"],
      },
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.filename.endsWith(".webp")).toBe(true);
    expect(result.info.generated).toBe(true);
    expect(result.info.generatedBy).toEqual(["imagemin"]);

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
      minimizerOptions: {},
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].toString()).toMatch(/Error: No plugins found/);
    expect(result.errors).toHaveLength(0);
  });

  it("should transform with 'ImageMinimizerPlugin.squooshMinify'", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.squooshMinify,
      input,
      filename,
      minimizerOptions: {},
    });

    expect(result.data.length).toBeLessThan(335);
    expect(result.info.minimized).toBe(true);
    expect(result.info.minimizedBy).toEqual(["squoosh"]);
    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("should transform with 'ImageMinimizerPlugin.squooshMinify' 2", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const [result] = await minify({
      minify: ImageMinimizerPlugin.squooshMinify,
      input,
      filename,
      minimizerOptions: {
        encodeOptions: {
          mozjpeg: {
            progressive: false,
            // eslint-disable-next-line camelcase
            color_space: 1,
          },
        },
      },
    });

    expect(result.data.length).toBeLessThan(160);
    expect(result.info.minimized).toBe(true);
    expect(result.info.minimizedBy).toEqual(["squoosh"]);
    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("should transform with 'ImageMinimizerPlugin.squooshGenerate'", async () => {
    const filename = path.resolve(__dirname, "./fixtures/loader-test.jpg");
    const input = await pify(fs.readFile)(filename);
    const results = await minify({
      minify: ImageMinimizerPlugin.squooshGenerate,
      input,
      filename,
      minimizerOptions: {
        encodeOptions: {
          mozjpeg: {},
          oxipng: {},
          webp: {},
        },
      },
    });

    const [, jpg, png, webp] = results;

    expect(jpg.data.length).toBeLessThan(335);
    expect(jpg.info.generated).toBe(true);
    expect(jpg.info.generatedBy).toEqual(["squoosh"]);
    expect(jpg.warnings).toHaveLength(0);
    expect(jpg.errors).toHaveLength(0);
    expect(png.data.length).toBeLessThan(70);
    expect(png.info.generated).toBe(true);
    expect(png.info.generatedBy).toEqual(["squoosh"]);
    expect(png.warnings).toHaveLength(0);
    expect(png.errors).toHaveLength(0);
    expect(webp.data.length).toBeLessThan(50);
    expect(webp.info.generated).toBe(true);
    expect(webp.info.generatedBy).toEqual(["squoosh"]);
    expect(webp.warnings).toHaveLength(0);
    expect(webp.errors).toHaveLength(0);
  });
});
