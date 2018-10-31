"use strict";

const os = require("os");
const RawSource = require("webpack-sources/lib/RawSource");
const createThrottle = require("async-throttle");
const nodeify = require("nodeify");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const path = require("path");

const minify = require("./minify");
const { interpolateName } = require("./utils");

class ImageminPlugin {
  constructor(options = {}) {
    const cpus = os.cpus() || { length: 1 };
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
      manifest,
      maxConcurrency = Math.max(1, cpus.length - 1),
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
  }

  apply(compiler) {
    const plugin = { name: "ImageminPlugin" };

    if (typeof this.options.bail !== "boolean") {
      this.options.bail = compiler.options.bail;
    }

    if (this.options.loader) {
      compiler.hooks.afterEnvironment.tap(plugin, () => {
        const {
          cache,
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
            imageminOptions,
            name
          },
          test
        });
      });
    }

    compiler.hooks.emit.tapAsync(plugin, (compilation, callback) => {
      const { assets } = compilation;
      const assetsForMinify = new Set();

      Object.keys(assets).forEach(file => {
        if (!ModuleFilenameHelpers.matchObject(this.options, file)) {
          return;
        }

        // eslint-disable-next-line no-underscore-dangle
        if (assets[file].source()._compressed) {
          return;
        }

        assetsForMinify.add(file);
      });

      if (assetsForMinify.size === 0) {
        return callback();
      }

      const {
        bail,
        cache,
        imageminOptions,
        maxConcurrency,
        manifest,
        name
      } = this.options;

      const throttle = createThrottle(maxConcurrency);

      return nodeify(
        Promise.all(
          [...assetsForMinify].map(file =>
            throttle(() => {
              const asset = assets[file];

              return Promise.resolve()
                .then(() =>
                  minify({
                    bail,
                    cache,
                    imageminOptions,
                    input: asset.source()
                  })
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
    });
  }
}

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminPlugin;
