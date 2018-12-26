import fs from "fs";
import path from "path";
import cacache from "cacache";
import del from "del";
import findCacheDir from "find-cache-dir";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import pify from "pify";
import test from "ava";
import minify from "../src/minify";

function isPromise(obj) {
  return (
    Boolean(obj) &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

test("minify should be is function", t => {
  t.true(typeof minify === "function");
});

test("should optimize", t =>
  pify(fs.readFile)(path.resolve(__dirname, "./fixtures/loader-test.jpg")).then(
    data =>
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
            t.true(result.output.length === compressedImage.length);

            return compressedImage;
          })
          .then(() => result)
      )
  ));

test("should return `Promise`", t => {
  const result = minify({
    imageminOptions: {
      plugins: [imageminMozjpeg()]
    },
    input: Buffer.from("Foo")
  });

  t.true(isPromise(result));
});

test("should throw error on empty", t => {
  const result = minify();

  t.true(result.errors.length === 1);

  for (const error of result.errors) {
    t.regex(error.message, /Empty\sinput/);
  }
});

test("should throw error on empty `imagemin` options", t => {
  const result = minify({
    imageminOptions: {},
    input: Buffer.from("Foo")
  });

  t.true(result.errors.length === 1);

  for (const error of result.errors) {
    t.regex(error.message, /No\splugins\sfound\sfor\s`imagemin`/);
  }
});

test("should containt warning on broken image (no `bail` option)", t =>
  pify(fs.readFile)(
    path.resolve(__dirname, "./fixtures/test-corrupted.jpg")
  ).then(data =>
    minify({
      imageminOptions: {
        plugins: [imageminMozjpeg()]
      },
      input: data
    }).then(result => {
      t.true(result.errors.length === 0);
      t.regex([...result.warnings][0].message, /Corrupt\sJPEG\sdata/);
      t.true(result.warnings.length === 1);
      t.true(Buffer.compare(data, result.output) === 0);

      return result;
    })
  ));

test("should containt warning on broken image (`bail` option with `false` value)", t =>
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
      t.true(result.errors.length === 0);
      t.regex([...result.warnings][0].message, /Corrupt\sJPEG\sdata/);
      t.true(result.warnings.length === 1);
      t.true(Buffer.compare(data, result.output) === 0);

      return result;
    })
  ));

test("should containt warning on broken image (`bail` option with `true` value)", t =>
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
      t.regex([...result.errors][0].message, /Corrupt\sJPEG\sdata/);
      t.true(result.errors.length === 1);
      t.true(result.warnings.length === 0);
      t.true(Buffer.compare(data, result.output) === 0);

      return result;
    })
  ));

test("should return original content on invalid content (`String`)", t => {
  const input = "Foo";

  return minify({
    imageminOptions: {
      plugins: [imageminMozjpeg()]
    },
    input
  }).then(result => {
    t.true(result.output.toString() === input);

    return result;
  });
});

test("should return original content on invalid content (`Buffer`)", t => {
  const input = Buffer.from("Foo");

  return minify({
    imageminOptions: {
      plugins: [imageminMozjpeg()]
    },
    input
  }).then(result => {
    t.true(result.output === input);

    return result;
  });
});

test.serial(
  "should optimize and cache (`cache` option with `true` value)",
  t => {
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
              t.true(result.output.length === compressedImage.length);

              return compressedImage;
            })
            .then(() => result)
        )
      )
      .then(result =>
        cacache.ls(cacheDir).then(cachedAssets => {
          t.true(Object.keys(cachedAssets).length === 1, "1 cached assets");

          return result;
        })
      )
      .then(() => del(cacheDir));
  }
);

test.serial(
  "should optimize and cache (`cache` option with `{String}` value)",
  t => {
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
              t.true(result.output.length === compressedImage.length);

              return compressedImage;
            })
            .then(() => result)
        )
      )
      .then(result =>
        cacache.ls(cacheDir).then(cachedAssets => {
          t.true(Object.keys(cachedAssets).length === 1, "1 cached assets");

          return result;
        })
      )
      .then(() => del(cacheDir));
  }
);

test.serial(
  "should optimize and doesn't cache (`cache` option with `false` value)",
  t => {
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
              t.true(result.output.length === compressedImage.length);

              return compressedImage;
            })
            .then(() => result)
        )
      )
      .then(result =>
        cacache.ls(cacheDir).then(cachedAssets => {
          t.true(Object.keys(cachedAssets).length === 0, "0 cached assets");

          return result;
        })
      )
      .then(() => del(cacheDir));
  }
);
