"use strict";

const os = require("os");
const path = require("path");
const RawSource = require("webpack-sources/lib/RawSource");
const pLimit = require("p-limit");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");

const minify = require("./minify");
const { interpolateName } = require("./utils");

class ImageminPlugin {
  constructor(options = {}) {
    const cpus = os.cpus() || { length: 1 };
    const {
      cache = false,
      filter = () => true,
      test = /\.(jpe?g|png|gif|svg)$/i,
      include,
      exclude,
      bail = null,
      imageminOptions = {
        plugins: []
      },
      loader = true,
      manifest,
      maxConcurrency = Math.max(1, cpus.length - 1),
      name = "[hash].[ext]"
    } = options;

    this.options = {
      bail,
      cache,
      filter,
      exclude,
      imageminOptions,
      include,
      loader,
      manifest,
      maxConcurrency,
      name,
      test
    };
  }

  apply(compiler) {
    const plugin = { name: "ImageminPlugin" };

    if (typeof this.options.bail !== "boolean") {
      this.options.bail = compiler.options.bail;
    }

    const moduleAssets = {};

    compiler.hooks.compilation.tap(plugin, compilation => {
      compilation.hooks.moduleAsset.tap(plugin, (module, file) => {
        if (!module.userRequest) {
          return;
        }

        moduleAssets[file] = path.join(
          path.dirname(file),
          path.basename(module.userRequest)
        );
      });
    });

    if (this.options.loader) {
      compiler.hooks.afterPlugins.tap(plugin, () => {
        const {
          cache,
          filter,
          test,
          include,
          exclude,
          bail,
          imageminOptions,
          name
        } = this.options;

        compiler.options.module.rules.push({
          enforce: "pre",
          exclude,
          include,
          loader: path.join(__dirname, "imagemin-loader.js"),
          options: {
            bail,
            cache,
            filter,
            imageminOptions,
            name
          },
          test
        });
      });
    }

    compiler.hooks.emit.tapPromise(plugin, compilation => {
      const { context } = compiler.options;
      const { assets } = compilation;
      const assetsForMinify = [];

      Object.keys(assets).forEach(file => {
        if (!ModuleFilenameHelpers.matchObject(this.options, file)) {
          return;
        }

        // eslint-disable-next-line no-underscore-dangle
        if (assets[file].source()._compressed) {
          return;
        }

        assetsForMinify.push(file);
      });

      if (assetsForMinify.length === 0) {
        return Promise.resolve();
      }

      const {
        bail,
        cache,
        filter,
        imageminOptions,
        maxConcurrency,
        manifest,
        name
      } = this.options;

      const limit = pLimit(maxConcurrency);

      return Promise.all(
        [...assetsForMinify].map(file =>
          limit(() => {
            const asset = assets[file];

            return Promise.resolve()
              .then(() =>
                minify({
                  bail,
                  cache,
                  filter,
                  imageminOptions,
                  input: asset.source(),
                  sourcePath: path.join(context, file)
                })
              )
              .then(result => {
                const source = result.output
                  ? new RawSource(result.output)
                  : asset;

                if (result.warnings && result.warnings.length > 0) {
                  result.warnings.forEach(warning => {
                    compilation.warnings.push(warning);
                  });
                }

                if (result.errors && result.errors.length > 0) {
                  result.errors.forEach(warning => {
                    compilation.errors.push(warning);
                  });
                }

                if (moduleAssets[file] || result.filtered) {
                  compilation.assets[file] = source;

                  return Promise.resolve(source);
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
          }, file)
        )
      );
    });
  }
}

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminPlugin;
