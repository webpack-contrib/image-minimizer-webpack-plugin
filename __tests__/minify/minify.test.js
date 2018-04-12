import fs from "fs";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import minify from "../../src/minify/minify";
import path from "path";
import pify from "pify";
import test from "ava";

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

test("should execute successfully", t =>
  pify(fs.readFile)(path.resolve(__dirname, "../fixtures/test.jpg")).then(
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

  t.true(result.errors.size === 1);

  for (const error of result.errors) {
    t.regex(error.message, /Empty\sinput/);
  }
});

test("should throw error on empty `imagemin` options", t => {
  const result = minify({
    imageminOptions: {},
    input: Buffer.from("Foo")
  });

  t.true(result.errors.size === 1);

  for (const error of result.errors) {
    t.regex(error.message, /No\splugins\sfound\sfor\s`imagemin`/);
  }
});

test("should return original content on invalid content (string)", t => {
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

test("should return original content on invalid content (Buffer)", t => {
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
