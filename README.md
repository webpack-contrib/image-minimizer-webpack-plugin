<!--lint disable no-html-->

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" hspace="10"
      src="https://cdn.rawgit.com/webpack/media/e7485eb2/logo/icon.svg">
  </a>
  <h1>Imagemin Webpack</h1>
  <p>
    Plugin and Loader for <a href="http://webpack.js.org/">webpack</a> to optimize (compress) all images using <a href="https://github.com/imagemin/imagemin">imagemin</a>.
    Do not worry about size of images, now they are always optimized/compressed.
  </p>
</div>

<!--lint enable no-html-->

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![cover][cover]][cover-url]
[![chat][chat]][chat-url]
[![size][size]][size-url]

# image-minimizer-webpack-plugin

## Getting Started

This plugin can use 2 tools to optimize/generate images:

- [`imagemin`](https://github.com/imagemin/imagemin) - optimize your images by default, since it is stable and works with all types of images
- [`squoosh`](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh) - while working in experimental mode with `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` file types.

> ⚠️ By default we don't install anything

To begin, you'll need to install `image-minimizer-webpack-plugin` and image minimizer/generator:

- [imagemin](https://github.com/imagemin/imagemin):

```console
$ npm install image-minimizer-webpack-plugin imagemin --save-dev
```

> ⚠️ imagemin uses plugin to optimize/generate images, so you need to isntall them too

- [`squoosh`](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh):

```console
$ npm install image-minimizer-webpack-plugin @squoosh/lib --save-dev
```

Images can be optimized in two modes:

1.  [Lossless](https://en.wikipedia.org/wiki/Lossless_compression) (without loss of quality).
2.  [Lossy](https://en.wikipedia.org/wiki/Lossy_compression) (with loss of quality).

### Optimize with [imagemin](https://github.com/imagemin/imagemin)

Note:

- [imagemin-mozjpeg](https://github.com/imagemin/imagemin-mozjpeg) can be configured in lossless and lossy mode.
- [imagemin-svgo](https://github.com/imagemin/imagemin-svgo) can be configured in lossless and lossy mode.

Explore the options to get the best result for you.

**Recommended imagemin plugins for lossless optimization**

```shell
npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo --save-dev
```

**Recommended imagemin plugins for lossy optimization**

```shell
npm install imagemin-gifsicle imagemin-mozjpeg imagemin-pngquant imagemin-svgo --save-dev
```

For `imagemin-svgo` v9.0.0+ need use svgo [configuration](https://github.com/svg/svgo#configuration)

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { extendDefaultPlugins } = require("svgo");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
    ],
  },
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            // Lossless optimization with custom option
            // Feel free to experiment with options for better result for you
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              // Svgo configuration here https://github.com/svg/svgo#configuration
              [
                "svgo",
                {
                  plugins: extendDefaultPlugins([
                    {
                      name: "removeViewBox",
                      active: false,
                    },
                    {
                      name: "addAttributesToSVGElement",
                      params: {
                        attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                      },
                    },
                  ]),
                },
              ],
            ],
          },
        },
      }),
    ],
  },
};
```

### Optimize with [`squoosh`](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh)

```console
$ npm install @squoosh/lib --save-dev
```

**Recommended `@squoosh/lib` options for lossy optimization**

For lossy optimization we recommend using the default settings of `@squoosh/lib` package.
The default values and supported file types for each option can be found in the [codecs.ts](https://github.com/GoogleChromeLabs/squoosh/blob/dev/libsquoosh/src/codecs.ts) file under codecs.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  module: {
    rules: [
      // You need this, if you are using `import file from "file.ext"`, for `new URL(...)` syntax you don't need it
      {
        test: /\.(jpe?g|png)$/i,
        type: "asset",
      },
    ],
  },
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            // Your options for `squoosh`
          },
        },
      }),
    ],
  },
};
```

**Recommended `squoosh` options for lossless optimization**

For lossless optimization we recommend using the options listed below in `minimizer.options.encodeOptions`.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  module: {
    rules: [
      // You need this, if you are using `import file from "file.ext"`, for `new URL(...)` syntax you don't need it
      {
        test: /\.(jpe?g|png)$/i,
        type: "asset",
      },
    ],
  },
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                // That setting might be close to lossless, but it’s not guaranteed
                // https://github.com/GoogleChromeLabs/squoosh/issues/85
                quality: 100,
              },
              webp: {
                lossless: 1,
              },
              avif: {
                // https://github.com/GoogleChromeLabs/squoosh/blob/dev/codecs/avif/enc/README.md
                cqLevel: 0,
              },
            },
          },
        },
      }),
    ],
  },
};
```

### Advanced setup

If you want to use `loader` or `plugin` standalone see sections below, but this is **not recommended**.

By default, plugin configures `loader` (please use the `loader` option if you want to disable this behaviour), therefore you should not setup standalone loader when you use a plugin setup.

Loader optimizes or generates images using options, so inlined images via `data` URI (i.e. `data:`) will be optimized or generated too, not inlined images will be optimized too.

#### Standalone Loader

[Documentation: Using loaders](https://webpack.js.org/concepts/loaders/).

In your `webpack.config.js`, add the `ImageMinimizerPlugin.loader` and specify the [asset modules options](https://webpack.js.org/guides/asset-modules/) (if you use images in `import`):

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  module: {
    rules: [
      // You need this, if you are using `import file from "file.ext"`, for `new URL(...)` syntax you don't need it
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
      // We recommend using only for the "production" mode
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            enforce: "pre",
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    "imagemin-gifsicle",
                    "imagemin-mozjpeg",
                    "imagemin-pngquant",
                    "imagemin-svgo",
                  ],
                },
              },
            },
          },
        ],
      },
    ],
  },
};
```

### Standalone Plugin

[Documentation: Using plugins](https://webpack.js.org/concepts/plugins/).

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  module: {
    rules: [
      // You need this, if you are using `import file from "file.ext"`, for `new URL(...)` syntax you don't need it
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
    ],
  },
  optimization: {
    minimizer: [
      // Extend default minimizer, i.e. `terser-webpack-plugin` for JS
      "...",
      // We recommend using only for the "production" mode
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
        // Disable `loader`
        loader: false,
      }),
    ],
  },
};
```

## Options

### Plugin Options

|                        Name                         |                   Type                    |                           Default                           | Description                                                      |
| :-------------------------------------------------: | :---------------------------------------: | :---------------------------------------------------------: | :--------------------------------------------------------------- |
|                 **[`test`](#test)**                 | `{String\/RegExp\|Array<String\|RegExp>}` | <code>/\.(jpe?g\|png\|gif\|tif\|webp\|svg\|avif)\$/i</code> | Test to match files against                                      |
|              **[`include`](#include)**              | `{String\/RegExp\|Array<String\|RegExp>}` |                         `undefined`                         | Files to include                                                 |
|              **[`exclude`](#exclude)**              | `{String\/RegExp\|Array<String\|RegExp>}` |                         `undefined`                         | Files to exclude                                                 |
|            **[`minimizer`](#minimizer)**            |        `{Object \| Array<Object>}`        |                         `undefined`                         | Allows to setup default minimizer                                |
|            **[`generator`](#generator)**            |             `{Array<Object>}`             |                         `undefined`                         | Allow to setup default generators                                |
|        **[`severityError`](#severityerror)**        |                `{String}`                 |                          `'error'`                          | Allows to choose how errors are displayed                        |
|               **[`loader`](#loader)**               |                `{Boolean}`                |                           `true`                            | Automatically adding built-in loader                             |
|          **[`concurrency`](#concurrency)**          |                `{Number}`                 |             `Math.max(1, os.cpus().length - 1)`             | Maximum number of concurrency optimization processes in one time |
| **[`deleteOriginalAssets`](#deleteoriginalassets)** |                `{Boolean}`                |                           `true`                            | Allows to delete the original asset for minimizer                |

#### `test`

Type: `String|RegExp|Array<String|RegExp>`
Default: `/\.(jpe?g\|png\|gif\|tif\|webp\|svg\|avif)\$/i`

Test to match files against.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        test: /\.(jpe?g|png|gif|svg)$/i,
      }),
    ],
  },
};
```

#### `include`

Type: `String|RegExp|Array<String|RegExp>`
Default: `undefined`

Files to include.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        include: /\/includes/,
      }),
    ],
  },
};
```

#### `exclude`

Type: `String|RegExp|Array<String|RegExp>`
Default: `undefined`

Files to exclude.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        exclude: /\/excludes/,
      }),
    ],
  },
};
```

#### `minimizer`

Type: `Object|Array<Object>`
Default: `undefined`

Allows to setup default minify function.

Available minimizers:

- `ImageMinimizerPlugin.imageminMinify`
- `ImageMinimizerPlugin.squooshMinify`

##### `Object`

For imagemin:

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          // Implementation
          implementation: ImageMinimizerPlugin.imageminMinify,
          // Options
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
      }),
    ],
  },
};
```

More information and examples [here](https://github.com/imagemin/imagemin).

For squoosh:

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          // Implementation
          implementation: ImageMinimizerPlugin.squooshMinify,
          // Options
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 90,
              },
            },
          },
        },
      }),
    ],
  },
};
```

More information and examples [here](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh).

Minimizer option list:

###### `implementation`

Type: `Function`
Default: `undefined`

Configure the default `implementation`.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          // Implementation
          implementation: ImageMinimizerPlugin.squooshMinify,
        },
      }),
    ],
  },
};
```

###### `options`

Type: `Object`
Default: `undefined`

Options for the `implementation` option (i.e. options for `imagemin`/`squoosh`/custom implementation).

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          // Options
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 90,
              },
            },
          },
        },
      }),
    ],
  },
};
```

###### `filter`

Type: `Function`
Default: `() => true`

Allows filtering of images for optimization/generation.

Return `true` to optimize the image, `false` otherwise.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          filter: (source, sourcePath) => {
            // The `source` argument is a `Buffer` of source file
            // The `sourcePath` argument is an absolute path to source
            if (source.byteLength < 8192) {
              return false;
            }

            return true;
          },
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
      }),
    ],
  },
};
```

###### `filename`

Type: `string | Function`
Default: `undefined`

Allows to set the filename.
Supported values see in [`webpack template strings`](https://webpack.js.org/configuration/output/#template-strings), `File-level` section.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          filename: "optimized-[name][ext]",
          implementation: ImageMinimizerPlugin.squooshMinify,
          // Options
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 90,
              },
            },
          },
        },
      }),
    ],
  },
};
```

Example `Function` usage:

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          filename: () => "optimized-[name][ext]",
          implementation: ImageMinimizerPlugin.squooshMinify,
          // Options
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 90,
              },
            },
          },
        },
      }),
    ],
  },
};
```

##### `Array`

Allows to setup multiple minimizers.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                "imagemin-gifsicle",
                "imagemin-mozjpeg",
                "imagemin-pngquant",
                "imagemin-svgo",
              ],
            },
          },
          {
            implementation: (original, options) => {
              let result;

              try {
                result = minifyAndReturnBuffer(original.data);
              } catch (error) {
                // Return original input if there was an error
                return {
                  filename: original.filename,
                  data: original.data,
                  errors: [error],
                  warnings: [],
                };
              }

              return {
                filename: original.filename,
                data: result,
                warnings: [],
                errors: [],
                info: {
                  // Please always set it to prevent double minification
                  minimized: true,
                  // Optional
                  minimizedBy: ["custom-name-of-minimication"],
                },
              };
            },
            options: {
              // Custom options
            },
          },
        ],
      }),
    ],
  },
};
```

#### `generator`

Type: `Array<Object>`
Default: `undefined`

Allow to setup default generators.
Useful if you need generate `webp`/`avif`/etc from other formats.

> ⚠️ If no generator was found for the image (i.e. no `?as=webp` was found in query params), the `minimizer` option will be used. Therefore, it is recommended to configure generator outputs optimized image.
> ⚠️ The option will not work if you disable `loader` (i.e. set the `loader` option to `false`).

Available generators:

- `ImageMinimizerPlugin.imageminGenerate`
- `ImageMinimizerPlugin.squooshGenerate`

Example `webp` generator:

- imagemin

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              // Please specify only one plugin here, multiple plugins will not work
              plugins: ["imagemin-webp"],
            },
          },
        ],
      }),
    ],
  },
};
```

- squoosh

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                // Please specify only one codec here, multiple codecs will not work
                webp: {
                  quality: 90,
                },
              },
            },
          },
        ],
      }),
    ],
  },
};
```

Now you can generate the new image using:

```js
// Old approach for getting URL
import webp from "./file.jpg?as=webp";

// Assets modules
console.log(new URL("./file.jpg?as=webp"));
```

```css
div {
  background: url("./file.jpg?as=webp");
}
```

You can use `?as=webp` in any type of files.

Example multiple generators:

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 90,
                },
              },
            },
          },
          {
            // You can apply generator using `?as=avif`, you can use any name and provide more options
            preset: "avif",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                avif: {
                  cqLevel: 33,
                },
              },
            },
          },
        ],
      }),
    ],
  },
};
```

`squoosh` generator supports more options, for example you can resize an image:

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            // You can apply generator using `?as=webp-100-50`, you can use any name and provide more options
            preset: "webp-100-50",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                resize: {
                  enabled: true,
                  width: 100,
                  height: 50,
                },
                webp: {
                  quality: 90,
                },
              },
            },
          },
        ],
      }),
    ],
  },
};
```

You can find more information [here](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh).

You can use your own generator implementation.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: "webp",
            implementation: (original, options) => {
              let result;

              try {
                result = minifyAndReturnBuffer(original.data);
              } catch (error) {
                // Return original input if there was an error
                return {
                  filename: original.filename,
                  data: original.data,
                  errors: [error],
                  warnings: [],
                };
              }

              return {
                filename: original.filename,
                data: result,
                warnings: [],
                errors: [],
                info: {
                  // Please always set it to prevent double minification
                  generated: true,
                  // Optional
                  generatedBy: ["custom-name-of-minimication"],
                },
              };
            },
            options: {
              // Your options
            },
          },
        ],
      }),
    ],
  },
};
```

Generator option list:

###### `preset`

Type: `String`
Default: `undefined`

Configure the name of preset, i.e. you can use it in `?as=name`.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "name",
            // Implementation
            implementation: ImageMinimizerPlugin.squooshMinify,
          },
        ],
      }),
    ],
  },
};
```

###### `implementation`

Type: `Function`
Default: `undefined`

Configure the default `implementation`.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "name",
            // Implementation
            implementation: ImageMinimizerPlugin.squooshMinify,
          },
        ],
      }),
    ],
  },
};
```

###### `options`

Type: `Object`
Default: `undefined`

Options for the `implementation` option (i.e. options for `imagemin`/`squoosh`/custom implementation).

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "name",
            implementation: ImageMinimizerPlugin.squooshMinify,
            // Options
            options: {
              encodeOptions: {
                mozjpeg: {
                  quality: 90,
                },
              },
            },
          },
        ],
      }),
    ],
  },
};
```

###### `filter`

Type: `Function`
Default: `() => true`

Allows filtering of images for optimization/generation.

Return `true` to optimize the image, `false` otherwise.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "name",
            filter: (source, sourcePath) => {
              // The `source` argument is a `Buffer` of source file
              // The `sourcePath` argument is an absolute path to source
              if (source.byteLength < 8192) {
                return false;
              }

              return true;
            },
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                "imagemin-gifsicle",
                "imagemin-mozjpeg",
                "imagemin-pngquant",
                "imagemin-svgo",
              ],
            },
          },
        ],
      }),
    ],
  },
};
```

###### `filename`

Type: `string | Function`
Default: `undefined`

Allows to set the filename.
Supported values see in [`webpack template strings`](https://webpack.js.org/configuration/output/#template-strings), `File-level` section.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "name",
            filename: "generated-[name][ext]",
            implementation: ImageMinimizerPlugin.squooshMinify,
            // Options
            options: {
              encodeOptions: {
                mozjpeg: {
                  quality: 90,
                },
              },
            },
          },
        ],
      }),
    ],
  },
};
```

Example of `Function` usage:

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "name",
            filename: () => "generated-[name][ext]",
            implementation: ImageMinimizerPlugin.squooshMinify,
            // Options
            options: {
              encodeOptions: {
                mozjpeg: {
                  quality: 90,
                },
              },
            },
          },
        ],
      }),
    ],
  },
};
```

#### `severityError`

Type: `String`
Default: `'error'`

Allows to choose how errors are displayed.

Сan have the following values:

- `'off'` - suppresses errors and warnings
- `'warning'` - emit warnings instead errors
- `'error'` - emit errors

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        severityError: "warning",
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
      }),
    ],
  },
};
```

#### `loader`

Type: `Boolean`
Default: `true`

Automatically adding built-in `loader`, used to optimize/generate images.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        loader: false,
        // `generator` will not work in this case
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
      }),
    ],
  },
};
```

#### `concurrency`

Type: `Number`
Default: `Math.max(1, os.cpus().length - 1)`

Maximum number of concurrency optimization processes in one time.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        concurrency: 3,
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
      }),
    ],
  },
};
```

#### `deleteOriginalAssets`

Type: `Boolean`
Default: `true`

Allows removing original assets after optimization.

**Please use this option if you are set the `filename` option for the `minimizer` option, disable `loader: false` and want to keep optimized and not optimized assets.**

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        // Disable loader
        loader: false,
        // Allows to keep original asset and minimized assets with different filenames
        deleteOriginalAssets: false,
        minimizer: {
          filename: "[path][name].webp",
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
      }),
    ],
  },
};
```

### Loader Options

|                  Name                  |            Type             |   Default   | Description                               |
| :------------------------------------: | :-------------------------: | :---------: | :---------------------------------------- |
|    **[`minimizer`](#minimizer-1)**     | `{Object \| Array<Object>}` | `undefined` | Allows to setup default minimizer         |
|    **[`generator`](#generator-1)**     |      `{Array<Object>}`      | `undefined` | Allows to setup default generator         |
| **[`severityError`](severityerror-1)** |         `{String}`          |  `'error'`  | Allows to choose how errors are displayed |

#### `severityError`

Type: `String`
Default: `'error'`

Allows to choose how errors are displayed.

Сan have the following values:

- `'off'` - suppresses errors and warnings
- `'warning'` - emit warnings instead errors
- `'error'` - emit errors

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              severityError: "warning",
              minimizerOptions: {
                plugins: ["gifsicle"],
              },
            },
          },
        ],
      },
    ],
  },
};
```

#### `minimizer`

Type: `Object|Array<Object>`
Default: `undefined`

Allows to setup default minimizer.

##### `Object`

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: ImageMinimizerPlugin.loader,
        enforce: "pre",
        options: {
          minimizer: {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {
              // Your options
            },
          },
        },
      },
    ],
  },
};
```

For more information and supported options please read [here](#minimizer).

### `generator`

Type: `Array<Object>`
Default: `undefined`

Allow to setup default generators.
Useful if you need generate `webp`/`avif`/etc from other formats.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: "asset",
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: ImageMinimizerPlugin.loader,
        enforce: "pre",
        options: {
          generator: [
            {
              preset: "webp",
              implementation: ImageMinimizerPlugin.imageminGenerate,
              options: {
                plugins: ["iamgemin-webp"],
              },
            },
          ],
        },
      },
    ],
  },
};
```

For more information and supported options please read [here](#generator).

## Additional API

### `imageminNormalizeConfig(config)`

The function normalizes configuration (converts plugins names and options to `Function`s) for using in `imagemin` package directly.

```js
const imagemin = require("imagemin");
const { imageminNormalizeConfig } = require("image-minimizer-webpack-plugin");

/*
  console.log(imageminConfig);
  =>
  {
    plugins: [Function, Function],
    pluginsMeta: [
      { name: "imagemin-jpegtran", version: "x.x.x", options: {} },
      { name: "imagemin-pngquant", version: "x.x.x", options: { quality: [0.6, 0.8] }
    ]
  }
*/

(async () => {
  const imageminConfig = await imageminNormalizeConfig({
    plugins: ["jpegtran", ["pngquant", { quality: [0.6, 0.8] }]],
  });
  const files = await imagemin(["images/*.{jpg,png}"], {
    destination: "build/images",
    plugins: imageminConfig.plugins,
  });

  console.log(files);
  // => [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
})();
```

## Examples

### Optimize images based on size

You can use difference options (like `progressive`/`interlaced`/etc.) based on image size (example - don't do progressive transformation for small images).

What is `progressive` image? [`Answer here`](https://jmperezperez.com/medium-image-progressive-loading-placeholder/).

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [["jpegtran", { progressive: true }]],
          },
          // Only apply this one to files equal to or over 8192 bytes
          filter: (source) => {
            if (source.byteLength >= 8192) {
              return true;
            }

            return false;
          },
        },
      }),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [["jpegtran", { progressive: false }]],
          },
          // Only apply this one to files under 8192
          filter: (source) => {
            if (source.byteLength < 8192) {
              return true;
            }

            return false;
          },
        },
      }),
    ],
  },
};
```

### Optimize and generate `webp` images

- imagemin

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              "imagemin-gifsicle",
              "imagemin-mozjpeg",
              "imagemin-pngquant",
              "imagemin-svgo",
            ],
          },
        },
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: "webp",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
      }),
    ],
  },
};
```

- squoosh

**webpack.config.js**

```js
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
        },
        generator: [
          {
            // You can apply generator using `?as=webp`, you can use any name and provide more options
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 90,
                },
              },
            },
          },
        ],
      }),
    ],
  },
};
```

## Contributing

Please take a moment to read our contributing guidelines if you haven't yet done so.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/image-minimizer-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/image-minimizer-webpack-plugin
[node]: https://img.shields.io/node/v/image-minimizer-webpack-plugin.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/webpack-contrib/image-minimizer-webpack-plugin.svg
[deps-url]: https://david-dm.org/webpack-contrib/image-minimizer-webpack-plugin
[tests]: https://github.com/webpack-contrib/image-minimizer-webpack-plugin/workflows/image-minimizer-webpack-plugin/badge.svg
[tests-url]: https://github.com/webpack-contrib/image-minimizer-webpack-plugin/actions
[cover]: https://codecov.io/gh/webpack-contrib/image-minimizer-webpack-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/image-minimizer-webpack-plugin
[chat]: https://badges.gitter.im/webpack/webpack.svg
[chat-url]: https://gitter.im/webpack/webpack
[size]: https://packagephobia.now.sh/badge?p=image-minimizer-webpack-plugin
[size-url]: https://packagephobia.now.sh/result?p=image-minimizer-webpack-plugin
