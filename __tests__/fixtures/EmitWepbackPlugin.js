import fs from "fs";
import path from "path";
import RawSource from "webpack-sources/lib/RawSource.js";
import pify from "pify";

export default class EmitWepbackPlugin {
  constructor(options = {}) {
    this.options = Object.assign(
      {},
      {
        fileNames: ["plugin-test.jpg"]
      },
      options
    );
  }

  apply(compiler) {
    const plugin = { name: "EmitPlugin" };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const emitFn = (compilation, callback) => {
      const { fileNames } = this.options;

      return Promise.all(
        fileNames.map(fileName => {
          const filePath = path.join(__dirname, fileName);

          return Promise.resolve()
            .then(() => pify(fs.readFile)(filePath))
            .then(data => {
              compilation.assets[fileName] = new RawSource(data);

              return data;
            });
        })
      ).then(
        // eslint-disable-next-line promise/no-callback-in-promise
        () => callback()
      );
    };

    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync(plugin, emitFn);
    } else {
      compiler.plugin("emit", emitFn);
    }
  }
}
