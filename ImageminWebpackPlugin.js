"use strict";

const os = require("os");
const RawSource = require("webpack-sources/lib/RawSource");
const imagemin = require("imagemin");
const createThrottle = require("async-throttle");
const nodeify = require("nodeify");
const interpolateName = require("./utils/interpolate-name");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");

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

    if (
      !imageminOptions ||
      !imageminOptions.plugins ||
      imageminOptions.plugins.length === 0
    ) {
      throw new Error("No plugins found for imagemin");
    }
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
      const {
        maxConcurrency,
        imageminOptions,
        bail,
        name,
        manifest
      } = this.options;
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

              return Promise.resolve().then(() =>
                this.optimizeImage(asset, imageminOptions)
                  .catch(error => {
                    if (bail) {
                      throw error;
                    }

                    return Promise.resolve(asset);
                  })
                  .then(compressedAsset => {
                    const interpolatedName = interpolateName(file, name, {
                      content: compressedAsset.source()
                    });

                    compilation.assets[interpolatedName] = compressedAsset;

                    if (interpolatedName !== file) {
                      delete compilation.assets[file];
                    }

                    if (manifest) {
                      manifest[file] = interpolatedName;
                    }

                    return Promise.resolve(compressedAsset);
                  })
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

  optimizeImage(input) {
    const { imageminOptions } = this.options;
    // Grab the orig source and size
    const assetSource = input.source();
    const assetOrigSize = input.size();

    // Ensure that the contents i have are in the form of a buffer
    const assetContents = Buffer.isBuffer(assetSource)
      ? assetSource
      : Buffer.from(assetSource);

    // Await for imagemin to do the compression
    return Promise.resolve().then(() =>
      imagemin
        .buffer(assetContents, imageminOptions)
        .then(optimizedAssetContents => {
          if (optimizedAssetContents.length < assetOrigSize) {
            return new RawSource(optimizedAssetContents);
          }

          return input;
        })
    );
  }
}

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminWebpackPlugin;
