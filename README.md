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

This plugin uses [imagemin](https://github.com/imagemin/imagemin) to optimize your images.

## Getting Started

To begin, you'll need to install `image-minimizer-webpack-plugin`:

```console
$ npm install image-minimizer-webpack-plugin --save-dev
```

Images can be optimized in two modes:

1.  [Lossless](https://en.wikipedia.org/wiki/Lossless_compression) (without loss of quality).
2.  [Lossy](https://en.wikipedia.org/wiki/Lossy_compression) (with loss of quality).

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

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
        ],
      },
    ],
  },
  plugins: [
    new ImageMinimizerPlugin({
      minimizerOptions: {
        // Lossless optimization with custom option
        // Feel free to experiment with options for better result for you
        plugins: [
          ['gifsicle', { interlaced: true }],
          ['jpegtran', { progressive: true }],
          ['optipng', { optimizationLevel: 5 }],
          [
            'svgo',
            {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          ],
        ],
      },
    }),
  ],
};
```

> ℹ️ Only for `4` version of `webpack`: Make sure that plugin place after any plugins that add images or other assets which you want to optimized.\*\*

> ℹ️ If you want to use `loader` or `plugin` standalone see sections below, but this is not recommended.

### Standalone Loader

[Documentation: Using loaders](https://webpack.js.org/concepts/loaders/)

In your `webpack.config.js`, add the `ImageMinimizerPlugin.loader`, chained with the [file-loader](https://github.com/webpack/file-loader) or [url-loader](https://github.com/webpack-contrib/url-loader):

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              bail: false, // Ignore errors on corrupted images
              cache: true,
              minimizerOptions: {
                plugins: ['gifsicle'],
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

[Documentation: Using plugins](https://webpack.js.org/concepts/plugins/)

**webpack.config.js**

```js
const ImageminWebpack = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
        test: /\.(jpe?g|png|gif|svg)$/i,
      },
    ],
  },
  plugins: [
    // Make sure that the plugin placed after any plugins that added images
    new ImageminWebpack({
      bail: false, // Ignore errors on corrupted images
      cache: true,
      minimizerOptions: {
        plugins: ['gifsicle'],
      },
      // Disable `loader`
      loader: false,
    }),
  ],
};
```

## Options

### Plugin Options

<!--lint disable no-html-->

|          Name          |                   Type                    |                  Default                   | Description                                                                                                               |
| :--------------------: | :---------------------------------------: | :----------------------------------------: | :------------------------------------------------------------------------------------------------------------------------ |
|       **`test`**       | `{String\/RegExp\|Array<String\|RegExp>}` | <code>/\.(jpe?g\|png\|gif\|svg)\$/i</code> | Test to match files against                                                                                               |
|     **`include`**      | `{String\/RegExp\|Array<String\|RegExp>}` |                `undefined`                 | Files to `include`                                                                                                        |
|     **`exclude`**      | `{String\/RegExp\|Array<String\|RegExp>}` |                `undefined`                 | Files to `exclude`                                                                                                        |
|      **`filter`**      |               `{Function}`                |                `() => true`                | Allows filtering of images for optimization                                                                               |
|      **`cache`**       |            `{Boolean\|String}`            |                  `false`                   | Enable file caching                                                                                                       |
|       **`bail`**       |                `{Boolean}`                |          `compiler.options.bail`           | Emit warnings instead errors                                                                                              |
| **`minimizerOptions`** |                `{Object}`                 |             `{ plugins: [] }`              | Options for `imagemin`                                                                                                    |
|      **`loader`**      |                `{Boolean}`                |                   `true`                   | Automatically adding `imagemin-loader` (require for minification images using in `url-loader`, `svg-url-loader` or other) |
|  **`maxConcurrency`**  |                `{Number}`                 |    `Math.max(1, os.cpus().length - 1)`     | Maximum number of concurrency optimization processes in one time                                                          |

<!--lint enable no-html-->

#### `test`

Test to match files against.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
    }),
  ],
};
```

#### `include`

Files to include.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      include: /\/includes/,
    }),
  ],
};
```

#### `exclude`

Files to exclude.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      exclude: /\/excludes/,
    }),
  ],
};
```

#### `filter`

Allows filtering of images for optimization.

Return `true` to optimize the image, `false` otherwise.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      filter: (source, sourcePath) => {
        // The `source` argument is a `Buffer` of source file
        // The `sourcePath` argument is an absolute path to source
        if (source.byteLength < 8192) {
          return false;
        }

        return true;
      },
    }),
  ],
};
```

#### `cache`

Enable/disable file caching. Default path to cache directory: `node_modules/.cache/image-minimizer-webpack-plugin`.

##### `{Boolean}`

Enable/disable file caching.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      cache: true,
    }),
  ],
};
```

##### `{String}`

Enable file caching and set path to cache directory.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      cache: 'path/to/cache',
    }),
  ],
};
```

#### `bail`

Emit warnings instead errors.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      bail: true,
    }),
  ],
};
```

#### `minimizerOptions`

Options for `imagemin`.

More information and examples [here](https://github.com/imagemin/imagemin).

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [
          // Name
          'gifsicle',
          // Name with options
          ['mozjpeg', { quality: 80 }],
          // Full package name
          [
            'imagemin-svgo',
            {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          ],
          [
            // Custom package name
            'nonstandard-imagemin-package-name',
            { myOptions: true },
          ],
        ],
      },
    }),
  ],
};
```

#### `maxConcurrency`

Maximum number of concurrency optimization processes in one time.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      maxConcurrency: 3,
    }),
  ],
};
```

### Loader Options

|          Name          |        Type         |         Default         | Description                                 |
| :--------------------: | :-----------------: | :---------------------: | :------------------------------------------ |
|      **`filter`**      |    `{Function}`     |       `undefined`       | Allows filtering of images for optimization |
|      **`cache`**       | `{Boolean\|String}` |         `false`         | Enable file caching                         |
|       **`bail`**       |     `{Boolean}`     | `compiler.options.bail` | Emit warnings instead errors                |
| **`minimizerOptions`** |     `{Object}`      |    `{ plugins: [] }`    | Options for `imagemin`                      |

#### `filter`

Allows filtering of images for optimization.

Return `true` to optimize the image, `false` otherwise.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              cache: true,
              filter: (source, sourcePath) => {
                // The `source` argument is a `Buffer` of source file
                // The `sourcePath` argument is an absolute path to source
                if (source.byteLength < 8192) {
                  return false;
                }

                return true;
              },
              minimizerOptions: {
                plugins: ['gifsicle'],
              },
            },
          },
        ],
      },
    ],
  },
};
```

#### `cache`

Enable file caching. Default path to cache directory: `node_modules/.cache/image-minimizer-webpack-plugin`.

##### `{Boolean}`

Enable/disable file caching.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              cache: true,
              minimizerOptions: {
                plugins: ['gifsicle'],
              },
            },
          },
        ],
      },
    ],
  },
};
```

##### `{String}`

Enable file caching and set path to cache directory.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              cache: 'path/to/cache',
              minimizerOptions: {
                plugins: ['gifsicle'],
              },
            },
          },
        ],
      },
    ],
  },
};
```

#### `bail`

Emit warnings instead errors.

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              bail: true,
              minimizerOptions: {
                plugins: ['gifsicle'],
              },
            },
          },
        ],
      },
    ],
  },
};
```

#### `minimizerOptions`

Options for [`imagemin`](https://github.com/imagemin/imagemin)

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              bail: true,
              minimizerOptions: {
                plugins: [
                  ['gifsicle', { interlaced: true, optimizationLevel: 3 }],
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
```

## Additional API

### `normalizeConfig(config)`

The function normalizes configuration (converts plugins names and options to `Function`s) for using in `imagemin` package directly.

```js
const imagemin = require('imagemin');
const { normalizeConfig } = require('image-minimizer-webpack-plugin');
const imageminConfig = normalizeConfig({
  plugins: [
    'jpegtran',
    [
      'pngquant',
      {
        quality: [0.6, 0.8],
      },
    ],
  ],
});

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
  const files = await imagemin(['images/*.{jpg,png}'], {
    destination: 'build/images',
    plugins: imageminConfig.plugins,
  });

  console.log(files);
  // => [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
})();
```

## Examples

### Optimize images based on size

You can use difference options (like `progressive`/`interlaced` and etc) based on image size (example - don't do progressive transformation for small images).

What is `progressive` image? [`Answer here`](https://jmperezperez.com/medium-image-progressive-loading-placeholder/).

**webpack.config.js**

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  minimizer: [
    new ImageMinimizerPlugin({
      // Only apply this one to files equal to or over 8192 bytes
      filter: (source) => {
        if (source.byteLength >= 8192) {
          return true;
        }

        return false;
      },
      minimizerOptions: {
        plugins: [['jpegtran', { progressive: true }]],
      },
    }),
    new ImageMinimizerPlugin({
      // Only apply this one to files under 8192
      filter: (source) => {
        if (source.byteLength < 8192) {
          return true;
        }

        return false;
      },
      minimizerOptions: {
        plugins: [['jpegtran', { progressive: false }]],
      },
    }),
  ],
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
