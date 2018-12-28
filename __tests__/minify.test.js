import fs from "fs";
import path from "path";
import cacache from "cacache";
import del from "del";
import findCacheDir from "find-cache-dir";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminSvgo from "imagemin-svgo";
import pify from "pify";
import minify from "../src/minify";

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
        minify({
          imageminOptions: {
            plugins: [imageminMozjpeg()]
          },
          input: Buffer.from("Foo")
        })
      )
    ).toBe(true));

  it("should optimize", async () => {
    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/loader-test.jpg")
    );
    const result = await minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()]
    });

    expect(result.output.equals(optimizedSource)).toBe(true);
  });

  it("should return optimized image even when optimized image large then original", async () => {
    const svgoOptions = {
      plugins: [
        {
          addAttributesToSVGElement: {
            attributes: [{ xmlns: "http://www.w3.org/2000/svg" }]
          }
        }
      ]
    };

    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/large-after-optimization.svg")
    );
    const result = await minify({
      imageminOptions: {
        plugins: [imageminSvgo(svgoOptions)]
      },
      input
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)]
    });

    expect(result.output.equals(optimizedSource)).toBe(true);
  });

  it("should throw error on empty", () => {
    const result = minify();

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(/Empty\sinput/);
  });

  it("should throw error on empty `imagemin` options", () => {
    const result = minify({
      imageminOptions: {},
      input: Buffer.from("Foo")
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].toString()).toMatch(
      /No\splugins\sfound\sfor\s`imagemin`/
    );
  });

  it("should contains warning on broken image (no `bail` option)", async () => {
    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/test-corrupted.jpg")
    );
    const result = await minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect([...result.warnings][0].message).toMatch(/Corrupt\sJPEG\sdata/);
    expect(result.output.equals(input)).toBe(true);
  });

  it("should contains warning on broken image (`bail` option with `false` value)", async () => {
    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/test-corrupted.jpg")
    );
    const result = await minify({
      bail: false,
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect([...result.warnings][0].message).toMatch(/Corrupt\sJPEG\sdata/);
    expect(result.output.equals(input)).toBe(true);
  });

  it("should contains warning on broken image (`bail` option with `true` value)", async () => {
    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/test-corrupted.jpg")
    );
    const result = await minify({
      bail: true,
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect([...result.errors][0].message).toMatch(/Corrupt\sJPEG\sdata/);
    expect(result.output.equals(input)).toBe(true);
  });

  it("should return original content on invalid content (`String`)", async () => {
    const input = "Foo";
    const result = await minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.output.toString()).toBe(input);
  });

  it("should return original content on invalid content (`Buffer`)", async () => {
    const input = Buffer.from("Foo");
    const result = await minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.output.equals(input)).toBe(true);
  });

  it("should optimize and cache (`cache` option with `true` value)", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const cacheDir = findCacheDir({ name: "imagemin-webpack" });

    await del(cacheDir);

    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/loader-test.jpg")
    );
    const result = await minify({
      cache: cacheDir,
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()]
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondResult = await minify({
      cache: cacheDir,
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(secondResult.warnings).toHaveLength(0);
    expect(secondResult.errors).toHaveLength(0);
    expect(secondResult.output.equals(optimizedSource)).toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await del(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimize and cache (`cache` option with `{String}` value)", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const cacheDir = findCacheDir({ name: "minify-cache" });

    await del(cacheDir);

    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/loader-test.jpg")
    );
    const result = await minify({
      cache: cacheDir,
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });
    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()]
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.output.equals(optimizedSource)).toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(1);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(1);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondResult = await minify({
      cache: cacheDir,
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    expect(secondResult.warnings).toHaveLength(0);
    expect(secondResult.errors).toHaveLength(0);
    expect(secondResult.output.equals(optimizedSource)).toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(1);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await del(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimize and doesn't cache (`cache` option with `false` value)", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/loader-test.jpg")
    );
    const result = await minify({
      cache: false,
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    });

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()]
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.output.equals(optimizedSource)).toBe(true);

    expect(spyGet).toHaveBeenCalledTimes(0);
    expect(spyPut).toHaveBeenCalledTimes(0);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should not optimize filtered", async () => {
    const input = await pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/loader-test.jpg")
    );
    const result = await minify({
      filter: (source, sourcePath) => {
        expect(source).toBeInstanceOf(Buffer);
        expect(typeof sourcePath).toBe("string");

        if (source.byteLength === 631) {
          return false;
        }

        return true;
      },
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input,
      sourcePath: "foo.png"
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.output.equals(input)).toBe(true);
    expect(result.sourcePath).toBe("foo.png");
    expect(result.filtered).toBe(true);
  });
});
