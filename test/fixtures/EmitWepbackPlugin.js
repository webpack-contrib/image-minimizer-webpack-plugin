import fs from "fs/promises";
import path from "path";

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
            const data = await fs.readFile(filePath);

            let source = mapCache.get(fileName);

            if (!source) {
              source = new RawSource(data);
              mapCache.set(fileName, source);
            }

            compilation.emitAsset(fileName, source);
          })
        );
      });
    });
  }
}
