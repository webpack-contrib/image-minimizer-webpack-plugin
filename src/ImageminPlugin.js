"use strict";

const path = require("path");
const webpack = require("webpack");
const RawSource = require("webpack-sources/lib/RawSource");
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const loaderUtils = require("loader-utils");

const minify = require("./minify");

class ImageminPlugin {
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
      manifest,
      maxConcurrency,
      name = "[hash].[ext]",
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
      test,
    };
  }

  static isWebpack4() {
    return webpack.version[0] === "4";
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

    // Collect assets from modules
    compiler.hooks.compilation.tap({ name: pluginName }, (compilation) => {
      compilation.hooks.moduleAsset.tap(
        { name: pluginName },
        (module, file) => {
          moduleAssets.add(file);
        }
      );
    });

    if (this.options.loader) {
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

        if (include) {
          loader.include = include;
        }

        if (exclude) {
          loader.exclude = exclude;
        }

        compiler.options.module.rules.push(loader);
      });
    }

    const optimizeFn = async (compilation, assets) => {
      const { context } = compiler.options;
      const assetsForMinify = [];
      const {
        bail,
        cache,
        loader,
        filter,
        imageminOptions,
        maxConcurrency,
        manifest,
        name,
      } = this.options;

      Object.keys(assets).forEach((file) => {
        if (!matchObject(file)) {
          return;
        }

        // Exclude already optimized assets from `imagemin-loader`
        if (loader && moduleAssets.has(file)) {
          return;
        }

        const asset = assets[file];

        assetsForMinify.push({
          input: asset.source(),
          filePath: path.join(context, file),
        });
      });

      if (assetsForMinify.length === 0) {
        return Promise.resolve();
      }

      let results;

      try {
        results = await minify(assetsForMinify, {
          bail,
          filter,
          cache,
          imageminOptions,
          maxConcurrency,
        });
      } catch (error) {
        return Promise.reject(error);
      }

      results.forEach((result) => {
        const source = new RawSource(result.output);

        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            compilation.warnings.push(warning);
          });
        }

        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((warning) => {
            compilation.errors.push(warning);
          });
        }

        const originalResourcePath = path.relative(context, result.filePath);

        // Exclude:
        // 1. Module assets (`file-loader` already interpolated asset name)
        // 2. Filtered assets
        if (moduleAssets.has(originalResourcePath) || result.filtered) {
          compilation.assets[originalResourcePath] = source;

          return;
        }

        const interpolatedName = loaderUtils.interpolateName(
          { resourcePath: path.join(context, originalResourcePath) },
          name,
          { content: source.source(), context }
        );

        compilation.assets[interpolatedName] = source;

        if (interpolatedName !== originalResourcePath) {
          delete compilation.assets[originalResourcePath];
        }

        if (manifest && !manifest[originalResourcePath]) {
          manifest[originalResourcePath] = interpolatedName;
        }
      });

      return Promise.resolve();
    };

    if (ImageminPlugin.isWebpack4()) {
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

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminPlugin;
