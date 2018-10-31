import EmitPlugin from "./fixtures/EmitWepbackPlugin";
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

const plugins = [
  imageminGifsicle(),
  imageminMozjpeg(),
  imageminPngquant(),
  imageminSvgo()
];

const fixturesPath = path.join(__dirname, "./fixtures");

function runWebpack(options = {}) {
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
            { loader: "file-loader", options: { name: "[path][name].[ext]" } }
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
    config.plugins = config.plugins.concat(
      new ImageminPlugin(
        options.imageminPluginOptions
          ? options.imageminPluginOptions
          : {
              cache: false,
              imageminOptions: {
                plugins
              },
              name: "[path][name].[ext]"
            }
      )
    );
  }

  return pify(webpack)(config);
}

function isCompressed(originalNames, assets) {
  return Promise.all(
    originalNames.map(originalName => {
      const asset = assets[originalName];
      const source = asset.source();

      if (!Buffer.isBuffer(source)) {
        throw new Error(`Asset "${originalName}" is not a buffer`);
      }

      const pathToOriginal = path.join(fixturesPath, originalName);

      return Promise.resolve()
        .then(() => pify(fs.readFile)(pathToOriginal))
        .then(data =>
          imagemin.buffer(data, {
            plugins
          })
        )
        .then(compressedData => {
          if (compressedData.length !== asset.size()) {
            throw new Error(`Image "${originalName}" is not compressed.`);
          }

          return compressedData;
        });
    })
  );
}

export { runWebpack, isCompressed, plugins, fixturesPath };
