# imagemin-webpack

[![NPM version](https://img.shields.io/npm/v/imagemin-webpack.svg)](https://www.npmjs.org/package/imagemin-webpack) 
[![Travis Build Status](https://img.shields.io/travis/itgalaxy/imagemin-webpack/master.svg?label=build)](https://travis-ci.org/itgalaxy/imagemin-webpack) 
[![dependencies Status](https://david-dm.org/itgalaxy/imagemin-webpack/status.svg)](https://david-dm.org/itgalaxy/imagemin-webpack) 
[![devDependencies Status](https://david-dm.org/itgalaxy/imagemin-webpack/dev-status.svg)](https://david-dm.org/itgalaxy/imagemin-webpack?type=dev)
[![peerDependencies Status](https://david-dm.org/itgalaxy/imagemin-webpack/peer-status.svg)](https://david-dm.org/itgalaxy/imagemin-webpack?type=peer)
[![Greenkeeper badge](https://badges.greenkeeper.io/itgalaxy/imagemin-webpack.svg)](https://greenkeeper.io/)

Webpack loader and plugin to optimize (compress) all images using [imagemin](https://github.com/imagemin/imagemin).
Do not worry about size of images, now they are always compressed.

## Why

-   No extra dependencies (`imagemin-gifsicle`, `imagemin-pngquant`) in `dependencies` section into `package.json`.
    You decide for yourself what plugins to use.

-   This loader and plugin will optimize ANY images regardless of how they were added to webpack.
    `image-webpack-loader` don't optimize some images generating `favicons-webpack-plugin` or `copy-webpack-plugin`.
    `ImageminWebpackPlugin` don't optimize inlined images with `url-loader`.

-   Images optimized when inlined with `url-loader`. This can not be done with `imagemin-webpack-plugin`.

-   Throttle asynchronous images optimization (using `maxConcurrency` plugin option).
    This allows you to not overload the server when building.

-   All tested.

-   (Optional) Don't crash building process if your have corrupted image(s).

## Install

```shell
npm install imagemin-webpack --save-dev
```

## Usage

### Loader And Plugin

If you want to use `loader` or `plugin` standalone see sections below, but this is not recommended.

**By default plugin optimize only assets don't have chunks.**
**Make sure that plugin place after any plugins that add images or other assets which you want to optimized.**

```js
import { imageminloader, ImageminWebpackPlugin } from 'imagemin-webpack';
// Before importing imagemin plugin make sure you add it in `package.json` (`dependencies`) and install.
import imageminGifsicle from 'imagemin-gifsicle';

const plugins = [
    imageminGifsicle()
];

export default {
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader' // Or `url-loader`.
                    },
                    {
                        loader: imageminloader,
                        options: {
                            plugins
                        }
                    }
                ]
            }
        ]
    },
     plugins: [
        // Make sure that the plugin is after any plugins that add images.
        new ImageminWebpackPlugin({
            imageminOptions: {
                plugins
            }
        })
    ]
}
```

### Standalone Loader

[Documentation: Using loaders](https://webpack.js.org/concepts/loaders/)

In your `webpack.config.js`, add the `imagemin-webpack`, 
chained with the [file-loader](https://github.com/webpack/file-loader) 
or [url-loader](https://github.com/webpack-contrib/url-loader):

```js
import { imageminloader } from 'imagemin-webpack';
// Before importing imagemin plugin make sure you add it in `package.json` (`dependencies`) and install.
import imageminGifsicle from 'imagemin-gifsicle';

export default {
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader' // Or `url-loader`.
                    },
                    {
                        loader: imageminloader,
                        options: {
                            bail: false, // Ignore errors on corrupted images.
                            plugins: [
                                imageminGifsicle()
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

### Standalone Plugin

[Documentation: Using plugins](https://webpack.js.org/concepts/plugins/)

```js
import { ImageminWebpackPlugin } from 'imagemin-webpack';
// Before importing imagemin plugin make sure you add it in `package.json` (`dependencies`) and install.
import imageminGifsicle from 'imagemin-gifsicle';

const imageminManifest = {};

export default {
    // 
    module: {
        rules: [
            {
                loader: 'file-loader',
                options: {
                    emitFile: true, // Don't forget emit images.
                    name: '[path][name].[ext]'
                },
                test: /\.(jpe?g|png|gif|svg)$/i
            }
        ]
    },
    plugins: [
        // Make sure that the plugin is after any plugins that add images.
        new ImageminWebpackPlugin({
            bail: false,
            excludeChunksAssets: false,
            imageminOptions: {
                plugins: [
                    imageminGifsicle()
                ],
            },
            manifest: imageminManifest, // This object will contain source and interpolated filenames.
            maxConcurrency: os.cpus().length,
            name: '[hash].[ext]',
            test: /\.(jpe?g|png|gif|svg)$/i
        })
    ]
}
```

## Related

-   [imagemin](https://github.com/imagemin/imagemin) - API for this package.
-   [image-webpack-loader](https://github.com/tcoopman/image-webpack-loader) - inspiration, thanks.
-   [imagemin-webpack-plugin](https://github.com/Klathmon/imagemin-webpack-plugin) - inspiration, thanks.

## Contribution

Feel free to push your code if you agree with publishing under the MIT license.

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
