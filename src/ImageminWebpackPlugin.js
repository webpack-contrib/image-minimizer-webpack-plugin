"use strict";

const os = require("os");
const RawSource = require("webpack-sources/lib/RawSource");
const createThrottle = require("async-throttle");
const nodeify = require("nodeify");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const path = require("path");
const findCacheDir = require("find-cache-dir");

const minify = require("./minify/minify");
const { cacheWrapper, interpolateName, getAfter } = require("./utils");

class ImageminWebpackPlugin {
  constructor(options = {}) {
    // Strange in test with value `1`
    const CPULength = os.cpus().length;
    const {
      cache = false,
      test = /\.(jpe?g|png|gif|svg)$/i,
      include,
      exclude,
      bail = null,
      imageminOptions = {
        plugins: []
      },
      loader = true,
      manifest = null,
      maxConcurrency = CPULength > 1 ? CPULength - 1 : CPULength,
      name = "[hash].[ext]"
    } = options;

    this.options = {
      bail,
      cache,
      exclude,
      imageminOptions,
      include,
      loader,
      manifest,
      maxConcurrency,
      name,
      test
    };

    this.options.cacheDir =
      this.options.cache === true
        ? findCacheDir({ name: "imagemin-webpack" })
        : cache;
  }

  apply(compiler) {
    const excludeChunksAssets = new Set();
    const plugin = { name: "ImageminPlugin" };

    if (typeof this.options.bail !== "boolean") {
      this.options.bail = compiler.options.bail;
    }

    if (this.options.loader) {
      const afterResolveFn = (data, callback) => {
        const query = getAfter(data.resource, "?");
        const resourcePath = data.resource.substr(
          0,
          data.resource.length - query.length
        );

        if (!ModuleFilenameHelpers.matchObject(this.options, resourcePath)) {
          return callback(null, data);
        }

        const { bail, imageminOptions, name, cacheDir } = this.options;

        data.loaders.push({
          loader: path.join(__dirname, "imagemin-loader.js"),
          options: {
            bail,
            cache: cacheDir,
            imageminOptions,
            name
          }
        });

        return callback(null, data);
      };

      if (compiler.hooks) {
        compiler.hooks.normalModuleFactory.tap(plugin, normalModuleFactory => {
          normalModuleFactory.hooks.afterResolve.tapAsync(
            plugin,
            afterResolveFn
          );
        });
      } else {
        /* istanbul ignore next */
        compiler.plugin("normal-module-factory", normalModuleFactory => {
          normalModuleFactory.plugin("after-resolve", afterResolveFn);
        });
      }
    }

    const afterOptimizeAssetsFn = assets => {
      Object.keys(assets).forEach(file => {
        if (
          ModuleFilenameHelpers.matchObject(this.options, file) &&
          !excludeChunksAssets.has(file)
        ) {
          excludeChunksAssets.add(file);
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
      /* istanbul ignore next */
      compiler.plugin("compilation", compilation => {
        compilation.plugin("after-optimize-assets", afterOptimizeAssetsFn);
      });
    }

    const emitFn = (compilation, callback) => {
      const { assets } = compilation;
      const { maxConcurrency, name, manifest, bail, cacheDir } = this.options;
      const throttle = createThrottle(maxConcurrency);
      const assetsForMinify = new Set();

      Object.keys(assets).forEach(file => {
        if (excludeChunksAssets.has(file)) {
          return;
        }

        if (!ModuleFilenameHelpers.matchObject(this.options, file)) {
          return;
        }

        assetsForMinify.add(file);
      });

      if (assetsForMinify.size === 0) {
        return callback();
      }

      return nodeify(
        Promise.all(
          [...assetsForMinify].map(file =>
            throttle(() => {
              const asset = assets[file];
              const task = Object.assign(
                {},
                {
                  bail,
                  file,
                  input: asset.source(),
                  outputPath: compiler.outputPath
                },
                this.options
              );

              return Promise.resolve()
                .then(
                  () =>
                    cacheDir
                      ? cacheWrapper(minify(task), task, cacheDir)
                      : minify(task)
                )
                .then(result => {
                  const source = result.output
                    ? new RawSource(result.output)
                    : asset;

                  if (result.warnings && result.warnings.size > 0) {
                    result.warnings.forEach(warning => {
                      compilation.warnings.push(warning);
                    });
                  }

                  if (result.errors && result.errors.size > 0) {
                    result.errors.forEach(warning => {
                      compilation.errors.push(warning);
                    });
                  }

                  const interpolatedName = interpolateName(file, name, {
                    content: source.source()
                  });

                  compilation.assets[interpolatedName] = source;

                  if (interpolatedName !== file) {
                    delete compilation.assets[file];
                  }

                  if (manifest && !manifest[file]) {
                    manifest[file] = interpolatedName;
                  }

                  return Promise.resolve(source);
                });
            })
          )
        ),
        callback
      );
    };

    if (compiler.hooks) {
      compiler.hooks.emit.tapAsync(plugin, emitFn);
    } else {
      /* istanbul ignore next */
      compiler.plugin("emit", emitFn);
    }
  }
}

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminWebpackPlugin;
