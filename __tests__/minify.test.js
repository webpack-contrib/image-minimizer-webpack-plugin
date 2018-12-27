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
  it("minify should be is function", () => {
    expect(typeof minify === "function").toBe(true);
  });

  it("should optimize", () =>
    pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/loader-test.jpg")
    ).then(data =>
      minify({
        imageminOptions: {
          plugins: [imageminMozjpeg()]
        },
        input: data
      }).then(result =>
        imagemin
          .buffer(data, {
            plugins: [imageminMozjpeg()]
          })
          .then(compressedImage => {
            expect(result.output).toHaveLength(compressedImage.length);

            return compressedImage;
          })
          .then(() => result)
      )
    ));

  it("should return optimized image even when optimized image large then original", () => {
    const svgoOptions = {
      plugins: [
        {
          addAttributesToSVGElement: {
            attributes: [
              {
                xmlns: "http://www.w3.org/2000/svg"
              }
            ]
          }
        }
      ]
    };

    return pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/large-after-optimization.svg")
    ).then(data =>
      minify({
        imageminOptions: {
          plugins: [imageminSvgo(svgoOptions)]
        },
        input: data
      }).then(result =>
        imagemin
          .buffer(data, {
            plugins: [imageminSvgo(svgoOptions)]
          })
          .then(compressedImage => {
            expect(result.output).toHaveLength(compressedImage.length);

            return compressedImage;
          })
          .then(() => result)
      )
    );
  });

  it("should return `Promise`", () => {
    const result = minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input: Buffer.from("Foo")
    });

    expect(isPromise(result)).toBe(true);
  });

  it("should throw error on empty", () => {
    const result = minify();

    expect(result.errors).toHaveLength(1);

    for (const error of result.errors) {
      expect(error.message).toMatch(/Empty\sinput/);
    }
  });

  it("should throw error on empty `imagemin` options", () => {
    const result = minify({
      imageminOptions: {},
      input: Buffer.from("Foo")
    });

    expect(result.errors).toHaveLength(1);

    for (const error of result.errors) {
      expect(error.message).toMatch(/No\splugins\sfound\sfor\s`imagemin`/);
    }
  });

  it("should contains warning on broken image (no `bail` option)", () =>
    pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/test-corrupted.jpg")
    ).then(data =>
      minify({
        imageminOptions: {
          plugins: [imageminMozjpeg()]
        },
        input: data
      }).then(result => {
        expect(result.warnings).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
        expect([...result.warnings][0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(result.output.equals(data)).toBe(true);

        return result;
      })
    ));

  it("should contains warning on broken image (`bail` option with `false` value)", () =>
    pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/test-corrupted.jpg")
    ).then(data =>
      minify({
        bail: false,
        imageminOptions: {
          plugins: [imageminMozjpeg()]
        },
        input: data
      }).then(result => {
        expect(result.warnings).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
        expect([...result.warnings][0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(result.output.equals(data)).toBe(true);

        return result;
      })
    ));

  it("should contains warning on broken image (`bail` option with `true` value)", () =>
    pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/test-corrupted.jpg")
    ).then(data =>
      minify({
        bail: true,
        imageminOptions: {
          plugins: [imageminMozjpeg()]
        },
        input: data
      }).then(result => {
        expect(result.warnings).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect([...result.errors][0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(result.output.equals(data)).toBe(true);

        return result;
      })
    ));

  it("should return original content on invalid content (`String`)", () => {
    const input = "Foo";

    return minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    }).then(result => {
      expect(result.output.toString()).toBe(input);

      return result;
    });
  });

  it("should return original content on invalid content (`Buffer`)", () => {
    const input = Buffer.from("Foo");

    return minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input
    }).then(result => {
      expect(result.output.equals(input)).toBe(true);

      return result;
    });
  });

  it("should optimize and cache (`cache` option with `true` value)", () => {
    const cacheDir = findCacheDir({ name: "imagemin-webpack" });

    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        pify(fs.readFile)(path.resolve(__dirname, "./fixtures/loader-test.jpg"))
      )
      .then(data =>
        minify({
          cache: true,
          imageminOptions: {
            plugins: [imageminMozjpeg()]
          },
          input: data
        }).then(result =>
          imagemin
            .buffer(data, {
              plugins: [imageminMozjpeg()]
            })
            .then(compressedImage => {
              expect(result.output.equals(compressedImage)).toBe(true);

              return compressedImage;
            })
            .then(() => result)
        )
      )
      .then(result =>
        cacache.ls(cacheDir).then(cachedAssets => {
          expect(Object.keys(cachedAssets)).toHaveLength(1);

          return result;
        })
      )
      .then(() => del(cacheDir));
  });

  it("should optimize and cache (`cache` option with `{String}` value)", () => {
    const cacheDir = findCacheDir({ name: "minify-cache" });

    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        pify(fs.readFile)(path.resolve(__dirname, "./fixtures/loader-test.jpg"))
      )
      .then(data =>
        minify({
          cache: cacheDir,
          imageminOptions: {
            plugins: [imageminMozjpeg()]
          },
          input: data
        }).then(result =>
          imagemin
            .buffer(data, {
              plugins: [imageminMozjpeg()]
            })
            .then(compressedImage => {
              expect(result.output.equals(compressedImage)).toBe(true);

              return compressedImage;
            })
            .then(() => result)
        )
      )
      .then(result =>
        cacache.ls(cacheDir).then(cachedAssets => {
          expect(Object.keys(cachedAssets)).toHaveLength(1);

          return result;
        })
      )
      .then(() => del(cacheDir));
  });

  it("should optimize and doesn't cache (`cache` option with `false` value)", () => {
    const cacheDir = findCacheDir({ name: "imagemin-webpack" });

    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        pify(fs.readFile)(path.resolve(__dirname, "./fixtures/loader-test.jpg"))
      )
      .then(data =>
        minify({
          cache: false,
          imageminOptions: {
            plugins: [imageminMozjpeg()]
          },
          input: data
        }).then(result =>
          imagemin
            .buffer(data, {
              plugins: [imageminMozjpeg()]
            })
            .then(compressedImage => {
              expect(result.output.equals(compressedImage)).toBe(true);

              return compressedImage;
            })
            .then(() => result)
        )
      )
      .then(result =>
        cacache.ls(cacheDir).then(cachedAssets => {
          expect(Object.keys(cachedAssets)).toHaveLength(0);

          return result;
        })
      )
      .then(() => del(cacheDir));
  });

  it("should not optimize filtered", () =>
    pify(fs.readFile)(
      path.resolve(__dirname, "./fixtures/loader-test.jpg")
    ).then(input =>
      minify({
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
      }).then(result => {
        expect(result.warnings).toHaveLength(0);
        expect(result.errors).toHaveLength(0);
        expect(result.output.equals(input)).toBe(true);
        expect(result.sourcePath).toBe("foo.png");

        return result;
      })
    ));
});
