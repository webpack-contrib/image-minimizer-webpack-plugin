"use strict";

const cacache = require("cacache");
const crypto = require("crypto");
const serialize = require("serialize-javascript");
const imagemin = require("imagemin/package");

const pkg = require("../../package");

module.exports = (promise, task, cacheDir) => {
  // Need invalidate on all options in plugins
  // And version plugins
  const cacheKey = serialize({
    hash: crypto
      .createHash("md4")
      .update(task.input)
      .digest("hex"),
    imagemin: imagemin.version,
    "imagemin-webpack": pkg.version,
    "imagemin-webpack-task": task.imageminOptions,
    path: task.outputPath ? `${task.outputPath}/${task.file}` : task.file
  });

  return cacache.get(cacheDir, cacheKey).then(
    result => result.data,
    () =>
      Promise.resolve()
        .then(() => promise)
        .then(result =>
          cacache.put(cacheDir, cacheKey, result.output).then(() => result)
        )
  );
};
