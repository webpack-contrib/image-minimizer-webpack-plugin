import RawSource from "webpack-sources/lib/RawSource";
import fs from "fs";
import nodeify from "nodeify";
import path from "path";
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

    const emitFn = (compilation, callback) => {
      const { fileNames } = this.options;

      return nodeify(
        Promise.all(
          fileNames.map(fileName => {
            const filePath = path.join(__dirname, fileName);

            return Promise.resolve()
              .then(() => pify(fs.readFile)(filePath))
              .then(data => {
                compilation.assets[fileName] = new RawSource(data);

                return data;
              });
          })
        ),
        callback
      );
    };

    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync(plugin, emitFn);
    } else {
      compiler.plugin("emit", emitFn);
    }
  }
}
