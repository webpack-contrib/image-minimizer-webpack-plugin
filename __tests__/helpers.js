import ImageminPlugin from "..";
import fs from "fs";
import imagemin from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import path from "path";
import pify from "pify";
import tempy from "tempy";
import webpack from "webpack";
import EmitPlugin from "./fixtures/EmitWepbackPlugin";

const plugins = [
  imageminGifsicle(),
  imageminMozjpeg(),
  imageminPngquant(),
  imageminSvgo()
];

const fixturesPath = path.join(__dirname, "./fixtures");

function runWebpack(options = {}, multiCompiler = false) {
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
      ]
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
    const imageminPlugin = new ImageminPlugin(
      options.imageminPluginOptions
        ? options.imageminPluginOptions
        : {
            cache: false,
            imageminOptions: {
              plugins
            },
            name: "[path][name].[ext]"
          }
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
  }

  return pify(webpack)(multiCompiler ? [config, config] : config);
}

function isOptimized(originalPath, assets) {
  const source = assets[originalPath];

  if (!source) {
    throw new Error(`Can't find assets`);
  }

  const originalBuffer = source.source();
  const pathToOriginal = path.join(fixturesPath, originalPath);

  return Promise.resolve()
    .then(() => pify(fs.readFile)(pathToOriginal))
    .then(data =>
      imagemin.buffer(data, {
        plugins
      })
    )
    .then(optimizedBuffer => optimizedBuffer.equals(originalBuffer));
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
