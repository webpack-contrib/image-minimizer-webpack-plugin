import fs from "node:fs";
import path from "node:path";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";

import ImageMinimizerPlugin from "../src/index";

import EmitPlugin from "./fixtures/EmitWepbackPlugin";

const plugins = ["gifsicle", "mozjpeg", "pngquant", "svgo"];

const fixturesPath = path.join(__dirname, "./fixtures");

/**
 * @param {import("webpack").Compiler} compiler The webpack compiler
 * @returns {Promise<import("webpack").Stats>} The compilation stats
 */
function compile(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      return resolve(stats);
    });
  });
}

/**
 * @param {unknown} maybeOptions The webpack options
 * @param {boolean} getCompiler Whether to get compiler
 * @returns {Promise<import("webpack").Stats | import("webpack").Compiler>} The compilation result
 */
async function runWebpack(maybeOptions, getCompiler = false) {
  const maybeMultiCompiler = Array.isArray(maybeOptions)
    ? maybeOptions
    : [maybeOptions];

  const configs = [];
  const CopyPlugin = (await import("copy-webpack-plugin")).default;
  const { temporaryDirectory } = await import("tempy");

  for (const options of maybeMultiCompiler) {
    const config = {
      externals: options.externals,
      experiments: options.experiments,
      devtool: false,
      bail: options.bail,
      context: fixturesPath,
      entry: options.entry || path.join(fixturesPath, "./loader.js"),
      mode: options.mode || "development",
      optimization: options.optimization,
      cache: options.cache,
      module: {
        rules: [
          ...(!options.fileLoaderOff
            ? [
                {
                  test: options.test || /\.(jpe?g|png|gif|svg|webp)$/i,
                  use: [
                    {
                      loader: "file-loader",
                      options: {
                        name: options.name || "[path][name].[ext]",
                      },
                    },
                  ],
                },
              ]
            : []),
          ...(options.MCEP
            ? [
                {
                  test: /\.css$/,
                  use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    "css-loader",
                  ],
                },
              ]
            : []),
          ...(options.childPlugin
            ? [
                {
                  test: /child-compilation\.js$/,
                  loader: path.resolve(
                    __dirname,
                    "./fixtures/emit-asset-in-child-compilation-loader.js",
                  ),
                },
              ]
            : []),
          ...(options.emitAssetPlugin
            ? [
                {
                  test: /simple-emit\.js$/,
                  loader: path.resolve(
                    __dirname,
                    "./fixtures/emitAssetLoader.js",
                  ),
                },
              ]
            : []),
          ...(options.assetResource
            ? [
                {
                  test: /\.(jpe?g|png|gif|svg)$/i,
                  type: "asset/resource",
                },
              ]
            : []),
          ...(options.assetInline
            ? [
                {
                  test: /\.(jpe?g|png|gif|svg)$/i,
                  type: "asset/inline",
                },
              ]
            : []),
        ],
      },
      output: {
        publicPath: "",
        filename: "bundle.js",
        pathinfo: false,
        assetModuleFilename: options.name || "[name][ext]",
        path:
          options.output && options.output.path
            ? options.output.path
            : temporaryDirectory(),
      },
      plugins: [],
    };

    if (options.experiments) {
      config.experiments = options.experiments;
    }

    if (options.output && options.output.assetModuleFilename) {
      config.output.assetModuleFilename = options.output.assetModuleFilename;
    }

    if (options.imageminLoaderOptions) {
      if (config.module.rules[0].use) {
        config.module.rules[0].use = [
          ...config.module.rules[0].use,
          {
            loader: ImageMinimizerPlugin.loader,
            options: options.imageminLoaderOptions,
          },
        ];
      } else {
        config.module.rules.push({
          test: /\.(jpe?g|png|gif|svg)$/i,
          loader: ImageMinimizerPlugin.loader,
          options: options.imageminLoaderOptions,
        });
      }
    }

    if (options.emitPlugin || options.emitPluginOptions) {
      config.plugins = [
        ...config.plugins,
        new EmitPlugin(options.emitPluginOptions),
      ];
    }

    if (options.imageminPlugin || options.imageminPluginOptions) {
      const imageminPluginsOptions =
        Array.isArray(options.imageminPlugin) ||
        Array.isArray(options.imageminPluginOptions)
          ? options.imageminPlugin || options.imageminPluginOptions
          : [options.imageminPlugin || options.imageminPluginOptions];

      for (const imageminPluginOptions of imageminPluginsOptions) {
        const ImageMinimizerPluginCreated = new ImageMinimizerPlugin(
          typeof imageminPluginOptions === "boolean"
            ? {
                minimizerOptions: {
                  plugins,
                },
              }
            : imageminPluginOptions,
        );

        if (options.asMinimizer) {
          if (!config.optimization) {
            config.optimization = {};
          }

          config.optimization.minimize = true;
          config.optimization.minimizer = [ImageMinimizerPluginCreated];
        } else {
          config.plugins = [...config.plugins, ImageMinimizerPluginCreated];
        }
      }
    }

    if (options.MCEP) {
      config.plugins = [
        ...config.plugins,
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: "[name].css",
          chunkFilename: "[id].css",
        }),
      ];
    }

    if (options.copyPlugin) {
      config.plugins = [
        ...config.plugins,
        new CopyPlugin({
          patterns: [{ from: "plugin-test.jpg" }],
        }),
      ];
    }

    if (options.EmitNewAssetPlugin) {
      config.plugins = [
        ...config.plugins,
        // eslint-disable-next-line no-use-before-define
        new EmitNewAssetPlugin({
          name: "newImg.png",
        }),
      ];
    }

    configs.push(config);
  }

  if (getCompiler) {
    return webpack(configs.length === 1 ? configs[0] : configs);
  }

  return new Promise((resolve, reject) => {
    webpack(configs.length === 1 ? configs[0] : configs, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(stats);
    });
  });
}

/**
 * @param {string | string[]} originalPath The original path
 * @param {import("webpack").Compilation} compilation The compilation
 * @returns {Promise<boolean>} Whether the asset is optimized
 */
async function isOptimized(originalPath, compilation) {
  const { assets } = compilation;
  let name = originalPath;
  let realName = originalPath;

  if (Array.isArray(originalPath)) {
    [name, realName] = originalPath;
  }

  const source = assets[name];

  if (!source) {
    throw new Error("Can't find asset");
  }

  const { path: outputPath } = compilation.options.output;
  const pathToOriginal = path.join(fixturesPath, realName);
  const pathToEmitted = path.join(outputPath, name);

  const imagemin = (await import("imagemin")).default;
  const imageminSvgo = (await import("imagemin-svgo")).default;
  const imageminGifsicle = (await import("imagemin-gifsicle")).default;
  const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
  const imageminPngquant = (await import("imagemin-pngquant")).default;
  const data = await fs.promises.readFile(pathToOriginal);
  const optimizedBuffer = Buffer.from(
    await imagemin.buffer(data, {
      plugins: [
        imageminGifsicle(),
        imageminMozjpeg(),
        imageminPngquant(),
        imageminSvgo(),
      ],
    }),
  );
  const generatedBuffer = await fs.promises.readFile(pathToEmitted);

  return optimizedBuffer.equals(generatedBuffer);
}

/**
 * @param {string} id The module id
 * @param {import("webpack").Module[]} modules The modules
 * @returns {boolean} Whether the module has the loader
 */
function hasLoader(id, modules) {
  return [...modules].some((module) => {
    if (!module.id.endsWith(id)) {
      return false;
    }

    const { loaders } = module;

    return loaders.find(
      (loader) => loader.loader === ImageMinimizerPlugin.loader,
    );
  });
}

/**
 * @param {string} asset The asset name
 * @param {import("webpack").Compiler} compiler The compiler
 * @param {import("webpack").Stats} stats The stats
 * @returns {string} The asset content
 */
function readAsset(asset, compiler, stats) {
  const usedFs = compiler.outputFileSystem;
  const outputPath = stats.compilation.outputOptions.path;

  let data = "";
  let targetFile = asset;

  const queryStringIdx = targetFile.indexOf("?");

  if (queryStringIdx >= 0) {
    targetFile = targetFile.slice(0, Math.max(0, queryStringIdx));
  }

  try {
    data = usedFs.readFileSync(path.join(outputPath, targetFile));
  } catch (error) {
    data = error.toString();
  }

  return data;
}

/**
 * @param {string} string The string to normalize
 * @returns {string} The normalized path
 */
function normalizePath(string) {
  const isWin = process.platform === "win32";

  if (isWin) {
    return string.replaceAll("\\", "/");
  }

  return string;
}

/**
 * @param {string} dirPath The directory path
 * @returns {void}
 */
function clearDirectory(dirPath) {
  let files;

  try {
    files = fs.readdirSync(dirPath);
  } catch {
    return;
  }

  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const filePath = `${dirPath}/${files[i]}`;
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        clearDirectory(filePath);
      }
    }
  }

  fs.rmdirSync(dirPath);
}

/**
 * @param {boolean | () => boolean} predicate The predicate condition
 * @returns {import("@jest/globals").it | import("@jest/globals").xit} The test function
 */
function ifit(predicate) {
  const cond = typeof predicate === "function" ? predicate() : predicate;
  /* global it */
  return cond ? it : it.skip;
}

/**
 * @returns {boolean} Whether squoosh tests should be run
 */
function needSquooshTest() {
  const needTest = typeof process.env.SQUOOSH_TEST !== "undefined";

  // Disable tests for all and Nodejs > 16
  // see: https://github.com/webpack-contrib/image-minimizer-webpack-plugin/pull/345
  return needTest;
}

export default class EmitNewAssetPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const pluginName = this.constructor.name;

    const { RawSource } = compiler.webpack.sources;

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          const file = fs.readFileSync(
            path.resolve(__dirname, "fixtures", "newImg.png"),
          );

          compilation.emitAsset(this.options.name, new RawSource(file));
        },
      );
    });
  }
}

export {
  EmitNewAssetPlugin,
  clearDirectory,
  compile,
  fixturesPath,
  hasLoader,
  ifit,
  isOptimized,
  needSquooshTest,
  normalizePath,
  plugins,
  readAsset,
  runWebpack,
};
