# imagemin-webpack

[![NPM version](https://img.shields.io/npm/v/imagemin-webpack.svg)](https://www.npmjs.org/package/imagemin-webpack)
[![Travis Build Status](https://img.shields.io/travis/itgalaxy/imagemin-webpack/master.svg?label=build)](https://travis-ci.org/itgalaxy/imagemin-webpack)
[![dependencies Status](https://david-dm.org/itgalaxy/imagemin-webpack/status.svg)](https://david-dm.org/itgalaxy/imagemin-webpack)
[![devDependencies Status](https://david-dm.org/itgalaxy/imagemin-webpack/dev-status.svg)](https://david-dm.org/itgalaxy/imagemin-webpack?type=dev)
[![peerDependencies Status](https://david-dm.org/itgalaxy/imagemin-webpack/peer-status.svg)](https://david-dm.org/itgalaxy/imagemin-webpack?type=peer)

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

## Why

- No extra dependencies (`imagemin-gifsicle`, `imagemin-pngquant`) in `dependencies` section into `package.json`.
  You decide for yourself what plugins to use.

- This loader and plugin will optimize ANY images regardless of how they were added to webpack.
  `image-webpack-loader` don't optimize some images generating `favicons-webpack-plugin` or `copy-webpack-plugin`.
  `ImageminWebpackPlugin` don't optimize inlined images with `url-loader`.

- Images optimized when inlined with `url-loader` or `svg-url-loader`. This can't be done with `imagemin-webpack-plugin`.

- Throttle asynchronous images optimization (using `maxConcurrency` plugin option).
  This allows you to not overload a server when building.

- All tested.

- Persistent cache.

- (Optional) Don't crash building process if your have corrupted image(s).

## Install

```shell
npm install imagemin-webpack --save-dev
```

### Optionals

Images can be optimized in two modes:

1.  [Lossless](https://en.wikipedia.org/wiki/Lossless_compression) (without loss of quality).
2.  [Lossy](https://en.wikipedia.org/wiki/Lossy_compression) (with loss of quality).

Note:

- [imagemin-mozjpeg](https://github.com/imagemin/imagemin-mozjpeg) can be configured in lossless and lossy mode.
- [imagemin-svgo](https://github.com/imagemin/imagemin-svgo) can be configured in lossless and lossy mode.

Explore the options to get the best result for you.

**Recommended basic imagemin plugins for lossless optimization**

```shell
npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo --save-dev
```

**Recommended basic imagemin plugins for lossy optimization**

```shell
npm install imagemin-gifsicle imagemin-mozjpeg imagemin-pngquant imagemin-svgo --save-dev
```

### Basic

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader" // Or `url-loader` or your other loader
          }
        ]
      }
    ]
  },
  plugins: [
    // Make sure that the plugin is after any plugins that add images, example `CopyWebpackPlugin`
    new ImageminPlugin({
      bail: false, // Ignore errors on corrupted images
      cache: true,
      imageminOptions: {
        // Before using imagemin plugins make sure you have added them in `package.json` (`devDependencies`) and installed them

        // Lossless optimization with custom option
        // Feel free to experiment with options for better result for you
        plugins: [
          ["gifsicle", { interlaced: true }],
          ["jpegtran", { progressive: true }],
          ["optipng", { optimizationLevel: 5 }],
          [
            "svgo",
            {
              plugins: [
                {
                  removeViewBox: false
                }
              ]
            }
          ]
        ]
      }
    })
  ]
};
```

Note: **If you want to use `loader` or `plugin` standalone see sections below, but this is not recommended**.

Note: **Make sure that plugin place after any plugins that add images or other assets which you want to optimized.**

### Standalone Loader

[Documentation: Using loaders](https://webpack.js.org/concepts/loaders/)

In your `webpack.config.js`, add the `ImageminPlugin.loader`,
chained with the [file-loader](https://github.com/webpack/file-loader)
or [url-loader](https://github.com/webpack-contrib/url-loader):

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader" // Or `url-loader` or your other loader
          },
          {
            loader: ImageminPlugin.loader,
            options: {
              bail: false, // Ignore errors on corrupted images
              cache: true,
              imageminOptions: {
                plugins: ["gifsicle"]
              }
            }
          }
        ]
      }
    ]
  }
};
```

### Standalone Plugin

[Documentation: Using plugins](https://webpack.js.org/concepts/plugins/)

**webpack.config.js**

```js
const ImageminWebpack = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  module: {
    rules: [
      {
        loader: "file-loader",
        options: {
          emitFile: true, // Don't forget emit images
          name: "[path][name].[ext]"
        },
        test: /\.(jpe?g|png|gif|svg)$/i
      }
    ]
  },
  plugins: [
    // Make sure that the plugin placed after any plugins that added images
    new ImageminWebpack({
      bail: false, // Ignore errors on corrupted images
      cache: true,
      imageminOptions: {
        plugins: ["gifsicle"]
      },
      // Disable `loader`
      loader: false
    })
  ]
};
```

## Options

### Plugin Options

<!--lint disable no-html-->

|         Name          |                   Type                    |                  Default                   | Description                                                                                                               |
| :-------------------: | :---------------------------------------: | :----------------------------------------: | :------------------------------------------------------------------------------------------------------------------------ |
|      **`test`**       | `{String\/RegExp\|Array<String\|RegExp>}` | <code>/\.(jpe?g\|png\|gif\|svg)\$/i</code> | Test to match files against                                                                                               |
|     **`include`**     | `{String\/RegExp\|Array<String\|RegExp>}` |                `undefined`                 | Files to `include`                                                                                                        |
|     **`exclude`**     | `{String\/RegExp\|Array<String\|RegExp>}` |                `undefined`                 | Files to `exclude`                                                                                                        |
|     **`filter`**      |               `{Function}`                |                `() => true`                | Allows filtering of images for optimization                                                                               |
|      **`cache`**      |            `{Boolean\|String}`            |                  `false`                   | Enable file caching                                                                                                       |
|      **`bail`**       |                `{Boolean}`                |          `compiler.options.bail`           | Emit warnings instead errors                                                                                              |
| **`imageminOptions`** |                `{Object}`                 |             `{ plugins: [] }`              | Options for `imagemin`                                                                                                    |
|     **`loader`**      |                `{Boolean}`                |                   `true`                   | Automatically adding `imagemin-loader` (require for minification images using in `url-loader`, `svg-url-loader` or other) |
| **`maxConcurrency`**  |                `{Number}`                 |    `Math.max(1, os.cpus().length - 1)`     | Maximum number of concurrency optimization processes in one time                                                          |
|      **`name`**       |                `{String}`                 |               `[hash].[ext]`               | The target asset name                                                                                                     |
|    **`manifest`**     |                `{Object}`                 |                `undefined`                 | Contain optimized list of images from other plugins                                                                       |

<!--lint enable no-html-->

#### `test`

Test to match files against.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i
    })
  ]
};
```

#### `include`

Files to include.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      include: /\/includes/
    })
  ]
};
```

#### `exclude`

Files to exclude.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      exclude: /\/excludes/
    })
  ]
};
```

#### `filter`

Allows filtering of images for optimization.

Return `true` to optimize the image, `false` otherwise.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      filter: (source, sourcePath) => {
        // The `source` argument is a `Buffer` of source file
        // The `sourcePath` argument is an absolute path to source
        if (source.byteLength < 8192) {
          return false;
        }

        return true;
      }
    })
  ]
};
```

#### `cache`

Enable/disable file caching. Default path to cache directory: `node_modules/.cache/imagemin-webpack`.

**Be careful:** you should remove cache manually when you enable `cache` using `Function` configuration for imagemin plugins and change option(s) for plugin(s) (for example for `imagemin-gifsicle`).

##### `{Boolean}`

Enable/disable file caching.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      cache: true
    })
  ]
};
```

##### `{String}`

Enable file caching and set path to cache directory.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      cache: "path/to/cache"
    })
  ]
};
```

#### `bail`

Emit warnings instead errors.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      bail: true
    })
  ]
};
```

#### `imageminOptions`

Options for `imagemin`.

More information and examples [here](https://github.com/imagemin/imagemin).

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  plugins: [
    new ImageminPlugin({
      imageminOptions: {
        plugins: [
          // Name
          "gifsicle",
          // Name with options
          ["mozjpeg", { quality: 80 }],
          // Full package name
          [
            "imagemin-svgo",
            {
              plugins: [
                {
                  removeViewBox: false
                }
              ]
            }
          ],
          [
            // Custom package name
            "nonstandard-imagemin-package-name",
            { myOptions: true }
          ]
        ]
      }
    })
  ]
};
```

#### `maxConcurrency`

Maximum number of concurrency optimization processes in one time.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      maxConcurrency: 3
    })
  ]
};
```

#### `name`

The target asset name.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");

module.exports = {
  plugins: [
    new ImageminPlugin({
      name: "[hash]-compressed.[ext]"
    })
  ]
};
```

#### `manifest`

Contain optimized list of images from other plugins.

Note: contains only assets compressed by plugin.
Note: manifest will be contain list of optimized images only after `emit` event.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const ManifestPlugin = require("manifest-webpack-plugin");
const manifest = {};

module.exports = {
  plugins: [
    new ImageminPlugin({
      manifest
    }),
    new ManifestPlugin({
      // Contain compressed images
      manifest
    })
  ]
};
```

### Loader Options

|         Name          |        Type         |         Default         | Description                                 |
| :-------------------: | :-----------------: | :---------------------: | :------------------------------------------ |
|     **`filter`**      |    `{Function}`     |       `undefined`       | Allows filtering of images for optimization |
|      **`cache`**      | `{Boolean\|String}` |         `false`         | Enable file caching                         |
|      **`bail`**       |     `{Boolean}`     | `compiler.options.bail` | Emit warnings instead errors                |
| **`imageminOptions`** |     `{Object}`      |    `{ plugins: [] }`    | Options for `imagemin`                      |

#### `filter`

Allows filtering of images for optimization.

Return `true` to optimize the image, `false` otherwise.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader" // Or `url-loader` or your other loader
          },
          {
            loader: ImageminPlugin.loader,
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
              imageminOptions: {
                plugins: ["gifsicle"]
              }
            }
          }
        ]
      }
    ]
  }
};
```

#### `cache`

Enable file caching. Default path to cache directory: `node_modules/.cache/imagemin-webpack`.

##### `{Boolean}`

Enable/disable file caching.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader" // Or `url-loader` or your other loader
          },
          {
            loader: ImageminPlugin.loader,
            options: {
              cache: true,
              imageminOptions: {
                plugins: ["gifsicle"]
              }
            }
          }
        ]
      }
    ]
  }
};
```

##### `{String}`

Enable file caching and set path to cache directory.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader" // Or `url-loader` or your other loader
          },
          {
            loader: ImageminPlugin.loader,
            options: {
              cache: "path/to/cache",
              imageminOptions: {
                plugins: ["gifsicle"]
              }
            }
          }
        ]
      }
    ]
  }
};
```

#### `bail`

Emit warnings instead errors.

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader" // Or `url-loader` or your other loader
          },
          {
            loader: ImageminPlugin.loader,
            options: {
              bail: true,
              imageminOptions: {
                plugins: ["gifsicle"]
              }
            }
          }
        ]
      }
    ]
  }
};
```

#### `imageminOptions`

Options for `imagemin`.

More information and examples [here](https://github.com/imagemin/imagemin).

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminGifsicle = require("imagemin-gifsicle");

module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "file-loader" // Or `url-loader` or your other loader
          },
          {
            loader: ImageminPlugin.loader,
            options: {
              bail: true,
              imageminOptions: {
                plugins: [
                  ["gifsicle", { interlaced: true, optimizationLevel: 3 }]
                ]
              }
            }
          }
        ]
      }
    ]
  }
};
```

## Examples

### Optimize images based on size

You can use difference options (like `progressive`/`interlaced` and etc) based on image size (example - don't do progressive transformation for small images).

What is `progressive` image? [`Answer here`](https://jmperezperez.com/medium-image-progressive-loading-placeholder/).

**webpack.config.js**

```js
const ImageminPlugin = require("imagemin-webpack");
const imageminJpegtran = require("imagemin-jpegtran");

module.exports = {
  minimizer: [
    new ImageminPlugin({
      // Only apply this one to files equal to or over 8192 bytes
      filter: source => {
        if (source.byteLength >= 8192) {
          return true;
        }

        return false;
      },
      imageminOptions: {
        plugins: [["jpegtran", { progressive: true }]]
      }
    }),
    new ImageminPlugin({
      // Only apply this one to files under 8192
      filter: source => {
        if (source.byteLength < 8192) {
          return true;
        }

        return false;
      },
      imageminOptions: {
        plugins: [["jpegtran", { progressive: false }]]
      }
    })
  ]
};
```

## Additional API

### `normalizeConfig(config)`

The function normalizes configuration (converts plugins names and options to `Function`s) for using in `imagemin` package directly.

```js
const imagemin = require("imagemin");
const { normalizeConfig } = require("imagemin-webpack");
const imageminConfig = normalizeConfig({
  plugins: [
    "jpegtran",
    [
      "pngquant",
      {
        quality: [0.6, 0.8]
      }
    ]
  ]
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
  const files = await imagemin(["images/*.{jpg,png}"], {
    destination: "build/images",
    plugins: imageminConfig.plugins
  });

  console.log(files);
  // => [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
})();
```

## Related

- [imagemin](https://github.com/imagemin/imagemin) - API for this package.
- [image-webpack-loader](https://github.com/tcoopman/image-webpack-loader) - inspiration, thanks.
- [imagemin-webpack-plugin](https://github.com/Klathmon/imagemin-webpack-plugin) - inspiration, thanks.

## Contribution

Feel free to push your code if you agree with publishing under the MIT license.

## Changelog

[CHANGELOG](./CHANGELOG.md)

## License

[MIT](./LICENSE)
