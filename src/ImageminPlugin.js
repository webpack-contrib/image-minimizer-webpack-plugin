"use strict";

const path = require("path");
const webpack = require("webpack");
const RawSource = require("webpack-sources/lib/RawSource");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");

const minify = require("./minify");

class ImageMinimizerPlugin {
  constructor(options = {}) {
    const {
      cache = false,
      filter = () => true,
      test = /\.(jpe?g|png|gif|tif|webp|svg)$/i,
      include,
      exclude,
      bail = null,
      imageminOptions = {
        plugins: [],
      },
      loader = true,
      maxConcurrency,
    } = options;

    this.options = {
      bail,
      cache,
      filter,
      exclude,
      imageminOptions,
      include,
      loader,
      maxConcurrency,
      test,
    };
  }

  static isWebpack4() {
    return webpack.version[0] === "4";
  }

  async runTasks(compiler, compilation, assetNames) {
    const {
      bail,
      cache,
      filter,
      imageminOptions,
      maxConcurrency,
    } = this.options;

    let results;

    try {
      results = await minify(
        assetNames.map((assetName) => ({
          input: compilation.getAsset(assetName).source.source(),
          filename: assetName,
        })),
        {
          bail,
          filter,
          cache,
          imageminOptions,
          maxConcurrency,
        }
      );
    } catch (error) {
      return Promise.reject(error);
    }

    results.forEach((result) => {
      const { filtered, output, filename, warnings, errors } = result;

      if (filtered) {
        return;
      }

      if (warnings && warnings.length > 0) {
        warnings.forEach((warning) => {
          compilation.warnings.push(warning);
        });
      }

      if (errors && errors.length > 0) {
        errors.forEach((warning) => {
          compilation.errors.push(warning);
        });
      }

      compilation.assets[filename] = new RawSource(output);
    });

    return Promise.resolve();
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    if (typeof this.options.bail !== "boolean") {
      this.options.bail = compiler.options.bail;
    }

    const matchObject = ModuleFilenameHelpers.matchObject.bind(
      // eslint-disable-next-line no-undefined
      undefined,
      this.options
    );

    const moduleAssets = new Set();

    if (this.options.loader) {
      // Collect assets from modules
      compiler.hooks.compilation.tap({ name: pluginName }, (compilation) => {
        compilation.hooks.moduleAsset.tap(
          { name: pluginName },
          (module, file) => {
            moduleAssets.add(file);
          }
        );
      });

      compiler.hooks.afterPlugins.tap({ name: pluginName }, () => {
        const {
          cache,
          filter,
          test,
          include,
          exclude,
          bail,
          imageminOptions,
          name,
        } = this.options;

        const loader = {
          test,
          include,
          exclude,
          enforce: "pre",
          loader: path.join(__dirname, "imagemin-loader.js"),
          options: {
            bail,
            cache,
            filter,
            imageminOptions,
            name,
          },
        };

        compiler.options.module.rules.push(loader);
      });
    }

    const optimizeFn = async (compilation, assets) => {
      const assetNames = Object.keys(assets).filter((assetName) => {
        if (!matchObject(assetName)) {
          return false;
        }

        // Exclude already optimized assets from `image-minimizer-webpack-loader`
        if (this.options.loader && moduleAssets.has(assetName)) {
          return false;
        }

        return true;
      });

      if (assetNames.length === 0) {
        return Promise.resolve();
      }

      await this.runTasks(compiler, compilation, assetNames, moduleAssets);

      return Promise.resolve();
    };

    if (ImageMinimizerPlugin.isWebpack4()) {
      compiler.hooks.emit.tapPromise({ name: pluginName }, (compilation) =>
        optimizeFn(compilation, compilation.assets)
      );
    } else {
      // eslint-disable-next-line node/global-require
      const Compilation = require("webpack/lib/Compilation");

      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: pluginName,
            stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          },
          (assets) => optimizeFn(compilation, assets)
        );
      });
    }
  }
}

module.exports = ImageMinimizerPlugin;
