"use strict";

const os = require("os");
const RawSource = require("webpack-sources/lib/RawSource");
const createThrottle = require("async-throttle");
const nodeify = require("nodeify");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const minify = require("./minify/minify");
const interpolateName = require("./utils/interpolate-name");

class ImageminWebpackPlugin {
  constructor(options = {}) {
    const {
      test = /\.(jpe?g|png|gif|svg)$/i,
      include,
      exclude,
      bail = null,
      excludeChunksAssets = true,
      imageminOptions = {
        plugins: []
      },
      manifest = null,
      maxConcurrency = os.cpus().length,
      name = "[hash].[ext]"
    } = options;

    this.options = {
      bail,
      exclude,
      excludeChunksAssets,
      imageminOptions,
      include,
      manifest,
      maxConcurrency,
      name,
      test
    };
  }

  apply(compiler) {
    const excludeChunksAssets = [];
    const plugin = { name: "ImageminPlugin" };

    if (typeof this.options.bail !== "boolean" && compiler.options.bail) {
      this.options.bail = compiler.options.bail;
    }

    if (this.options.excludeChunksAssets) {
      const afterOptimizeAssetsFn = assets => {
        Object.keys(assets).forEach(file => {
          if (
            ModuleFilenameHelpers.matchObject(this.options, file) &&
            excludeChunksAssets.indexOf(file) === -1
          ) {
            excludeChunksAssets.push(file);
          }
        });
      };

      if (compiler.hooks) {
        compiler.hooks.compilation.tap(plugin, compilation => {
          compilation.hooks.afterOptimizeAssets.tap(
            plugin,
            afterOptimizeAssetsFn
          );
        });
      } else {
        compiler.plugin("compilation", compilation => {
          compilation.plugin("after-optimize-assets", afterOptimizeAssetsFn);
        });
      }
    }

    const emitFn = (compilation, callback) => {
      const { assets } = compilation;
      const { maxConcurrency, name, manifest } = this.options;
      const throttle = createThrottle(maxConcurrency);

      return nodeify(
        Promise.all(
          Object.keys(assets).map(file =>
            throttle(() => {
              const asset = assets[file];

              if (excludeChunksAssets.indexOf(file) !== -1) {
                return Promise.resolve(asset);
              }

              if (!ModuleFilenameHelpers.matchObject(this.options, file)) {
                return Promise.resolve(asset);
              }

              return minify(asset.source(), this.options).then(
                optimizedSource => {
                  const source = new RawSource(optimizedSource);

                  const interpolatedName = interpolateName(file, name, {
                    content: source.source()
                  });

                  compilation.assets[interpolatedName] = source;

                  if (interpolatedName !== file) {
                    delete compilation.assets[file];
                  }

                  if (manifest) {
                    manifest[file] = interpolatedName;
                  }

                  return Promise.resolve(source);
                }
              );
            })
          )
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

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminWebpackPlugin;
