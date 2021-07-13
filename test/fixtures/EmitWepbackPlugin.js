import fs from "fs";
import path from "path";
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
    const mapCache = new Map();

    compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tapPromise(plugin, () => {
        const { fileNames } = this.options;
        const { RawSource } = compiler.webpack.sources;

        return Promise.all(
          fileNames.map(async (fileName) => {
            const filePath = path.join(__dirname, fileName);
            const data = await pify(fs.readFile)(filePath);

            let source = mapCache.get(fileName);

            if (!source) {
              source = new RawSource(data);
              mapCache.set(fileName, source);
            }

            compilation.emitAsset(fileName, source, { foo: "bar", related: { foo: "bar" } });
          })
        );
      });
    });
  }
}
