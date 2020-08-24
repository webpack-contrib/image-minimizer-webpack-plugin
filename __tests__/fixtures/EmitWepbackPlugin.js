import fs from "fs";
import path from "path";
import RawSource from "webpack-sources/lib/RawSource.js";
import pify from "pify";

export default class EmitWepbackPlugin {
  constructor(options = {}) {
    this.options = Object.assign(
      {},
      {
        fileNames: ["plugin-test.jpg"],
      },
      options
    );
  }

  apply(compiler) {
    const plugin = { name: "EmitPlugin" };

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tapPromise(plugin, () => {
        const { fileNames } = this.options;

        return Promise.all(
          fileNames.map(async (fileName) => {
            const filePath = path.join(__dirname, fileName);
            const data = await pify(fs.readFile)(filePath);

            compilation.emitAsset(fileName, new RawSource(data));
          })
        );
      });
    });
  }
}
