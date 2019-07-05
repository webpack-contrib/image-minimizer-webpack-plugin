import fs from "fs";
import path from "path";
import imagemin from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import pify from "pify";
import tempy from "tempy";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import EmitPlugin from "./fixtures/EmitWepbackPlugin";
import ImageminPlugin from "..";

const plugins = ["gifsicle", "mozjpeg", "pngquant", "svgo"];

const fixturesPath = path.join(__dirname, "./fixtures");

function runWebpack(maybeOptions) {
  const maybeMultiCompiler = Array.isArray(maybeOptions)
    ? maybeOptions
    : [maybeOptions];

  const configs = [];

  maybeMultiCompiler.forEach(options => {
    const config = {
      bail: options.bail,
      context: fixturesPath,
      entry: options.entry
        ? options.entry
        : path.join(fixturesPath, "./loader.js"),
      mode: "development",
      module: {
        rules: [
          {
            test: options.test ? options.test : /\.(jpe?g|png|gif|svg)$/i,
            use: [
              {
                loader: "file-loader",
                options: {
                  name: options.name ? options.name : "[path][name].[ext]"
                }
              }
            ]
          }
        ].concat(
          options.MCEP
            ? {
                test: /\.css$/,
                use: [
                  {
                    loader: MiniCssExtractPlugin.loader
                  },
                  "css-loader"
                ]
              }
            : []
        )
      },
      output: {
        filename: "bundle.js",
        path:
          options.output && options.output.path
            ? options.output.path
            : tempy.directory()
      },
      plugins: []
    };

    if (options.imageminLoader || options.imageminLoaderOptions) {
      config.module.rules[0].use = config.module.rules[0].use.concat({
        loader: ImageminPlugin.loader,
        options: options.imageminLoaderOptions
          ? options.imageminLoaderOptions
          : {
              cache: false,
              imageminOptions: { plugins }
            }
      });
    }

    if (options.emitPlugin || options.emitPluginOptions) {
      config.plugins = config.plugins.concat(
        new EmitPlugin(options.emitPluginOptions)
      );
    }

    if (options.imageminPlugin || options.imageminPluginOptions) {
      const imageminPluginsOptions =
        Array.isArray(options.imageminPlugin) ||
        Array.isArray(options.imageminPluginOptions)
          ? options.imageminPlugin || options.imageminPluginOptions
          : [options.imageminPlugin || options.imageminPluginOptions];

      imageminPluginsOptions.forEach(imageminPluginOptions => {
        const imageminPlugin = new ImageminPlugin(
          typeof imageminPluginOptions === "boolean"
            ? {
                cache: false,
                imageminOptions: {
                  plugins
                },
                name: "[path][name].[ext]"
              }
            : imageminPluginOptions
        );

        if (options.asMinimizer) {
          if (!config.optimization) {
            config.optimization = {};
          }

          config.optimization.minimize = true;
          config.optimization.minimizer = [imageminPlugin];
        } else {
          config.plugins = config.plugins.concat(imageminPlugin);
        }
      });
    }

    if (options.MCEP) {
      config.plugins = config.plugins.concat(
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: "[name].css",
          chunkFilename: "[id].css"
        })
      );
    }

    configs.push(config);
  });

  return pify(webpack)(configs.length === 1 ? configs[0] : configs);
}

function isOptimized(originalPath, compilation) {
  const { assets } = compilation;
  let name = originalPath;
  let realName = originalPath;

  if (Array.isArray(originalPath)) {
    [name, realName] = originalPath;
  }

  const source = assets[name];

  if (!source) {
    throw new Error(`Can't find asset`);
  }

  const { path: outputPath } = compilation.options.output;
  const pathToOriginal = path.join(fixturesPath, realName);
  const pathToEmitted = path.join(outputPath, name);

  return Promise.resolve()
    .then(() => pify(fs.readFile)(pathToOriginal))
    .then(data =>
      imagemin.buffer(data, {
        plugins: [
          imageminGifsicle(),
          imageminMozjpeg(),
          imageminPngquant(),
          imageminSvgo()
        ]
      })
    )
    .then(optimizedBuffer =>
      Promise.resolve()
        .then(() => pify(fs.readFile)(pathToEmitted))
        .then(emmitedBuffer => optimizedBuffer.equals(emmitedBuffer))
    );
}

function hasLoader(id, modules) {
  return modules.some(module => {
    if (!module.id.endsWith(id)) {
      return false;
    }

    const { loaders } = module;

    return loaders.find(loader => loader.loader === ImageminPlugin.loader);
  });
}

export { runWebpack as webpack, isOptimized, plugins, fixturesPath, hasLoader };
