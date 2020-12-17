const fs = require("fs");
const path = require("path");

// eslint-disable-next-line node/no-sync
const imageContent = fs.readFileSync(
  path.resolve(__dirname, "./child-compilation-image.png")
);

class ChildCompilationPlugin {
  constructor(options = {}) {
    this.options = options.options || {};
  }

  apply(compiler) {
    const plugin = { name: this.constructor.name };
    const { RawSource } = compiler.webpack.sources;

    compiler.hooks.compilation.tap(plugin, (compilation) => {
      compilation.hooks.additionalAssets.tapAsync(plugin, (callback) => {
        compilation.emitAsset(
          "child-compilation-image.png",
          new RawSource(imageContent)
        );

        callback();
      });
    });
  }
}

export default function loader() {
  const callback = this.async();

  // eslint-disable-next-line no-underscore-dangle
  const childCompiler = this._compilation.createChildCompiler(
    "Child Compilation Plugin Test",
    this.options
  );

  new ChildCompilationPlugin().apply(childCompiler);

  childCompiler.runAsChild((error) => {
    if (error) {
      return callback(error);
    }

    return callback(null, "export default 1");
  });
}
