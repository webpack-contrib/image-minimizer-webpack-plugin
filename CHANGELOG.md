# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2020-10-07)


### ⚠ BREAKING CHANGES

* minimizerOptions
* `manifest` and `name` options were removed without replacements
* **deps:** minimum supported `Node.js` version is `10.13`

### Features

* `avif` extension added to default `test` ([#157](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/157)) ([ff86e79](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/ff86e794186990a6f20931f0ee71c45c5be995f7))
* `cache` option ([4b00d48](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/4b00d48e8a5ae01d7a0b31101d92cc6c050dc842))
* `filter` option ([#87](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/87)) ([9e8fc5d](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/9e8fc5db38d83c77a619d610ee56397b568ec603))
* `normalizeConfig` api helper ([#119](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/119)) ([6977f8f](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/6977f8f096bfe519bf05a47f440e983566a0eacd))
* add `webp` and `tif` to `test` option ([#96](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/96)) ([0c65084](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/0c65084d8684393d27634dbf4613b4974cf8b9a1))
* add filename option ([#155](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/155)) ([34ad848](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/34ad84879d1b3c5c8712141ec29311c5b211ba27))
* add keepOriginal option ([07b96bb](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/07b96bbc2ce41275804ad5e50f659d4acdbf0b13))
* enable cache by default ([d92e713](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/d92e71328dada0cca05219fcf1e80507d8b4eba3))
* improve cache ([4aa8f6f](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/4aa8f6f4048fe062fea99b8e215909635185e3d6))
* new configuration way ([#112](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/112)) ([c9f5430](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/c9f54304c441002f3be86131711142785705dd17))


### Bug Fixes

* better handling configuration errors ([#114](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/114)) ([6b192c2](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/6b192c29381e0c34429b6a7ca45c4c8e6b003c31))
* cache name for webpack@5 ([#165](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/165)) ([f800305](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/f800305fed18819ba7c194d7a0192498519a3b88))
* compatibility with webpack@5 ([85b1c20](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/85b1c209452d8beec9c97b909fb344a396cb6ea2))
* compatibility with webpack@5 ([#145](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/145)) ([d034906](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/d03490660489e5cb0accb6fb6056a637b7af065f))
* compatibility with webpack@5 ([#146](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/146)) ([022512b](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/022512b0b814e3d3ea21e2c46e3eef180a103bc0))
* don't add same file paths in `manifest` ([f9f3ac4](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/f9f3ac4e31789210449b1ef07028e2edda5cca70))
* don't break interpolated [path] on windows ([2915cbe](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/2915cbefced407d95462dd1dcc30a2e6d601b28b))
* increase perf for filtered assets ([#118](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/118)) ([32eae8c](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/32eae8c13ade659e0eb30c464f8d3890a071441c))
* optimize all images in multi compiler mode ([#90](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/90)) ([7ad3392](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/7ad3392d1276601d079874ee0c9fcc5e7b20df5e))
* relax `node` version in `engines` field ([#85](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/85)) ([99aca68](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/99aca6868501100954e9c3e1e193d83af273f86c))
* stop returning original file when the optimized file is larger ([#82](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/82)) ([ad58571](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/ad585717c33fbd714c45f9a5e965957a5059a07f))
* use `maxConcurrency`, use ` os.cpus().length - 1` for multi core systems and `1` for single core system ([f5dd8e1](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/f5dd8e1bb2de3dfc865ba59f77248cf7bfe2e5e8))
* **package:** update webpack-sources to version 1.0.0 ([f37dd16](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/f37dd1639533580991797a7fbd13a5ba311f132d))


* code ([f209b6b](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/f209b6bae2a8911fc24898f426576537d8a6c903))
* rename the imageminOptions to minimizerOptions ([#148](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/148)) ([3601cc5](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/3601cc53d5c50ecd836e5363de292e3a8e359226))
* **deps:** update ([#135](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/135)) ([6082caa](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/6082caa06a01dd4d249c4955dcd20472faa39905))

## [5.1.0](https://github.com/itgalaxy/imagemin-webpack/compare/v5.0.0...v5.1.0) (2019-07-23)

### Bug Fixes

- better handling configuration errors ([#114](https://github.com/itgalaxy/imagemin-webpack/issues/114)) ([6b192c2](https://github.com/itgalaxy/imagemin-webpack/commit/6b192c2))
- increase perf for filtered assets ([#118](https://github.com/itgalaxy/imagemin-webpack/issues/118)) ([32eae8c](https://github.com/itgalaxy/imagemin-webpack/commit/32eae8c))

### Features

- `normalizeConfig` api helper ([#119](https://github.com/itgalaxy/imagemin-webpack/issues/119)) ([6977f8f](https://github.com/itgalaxy/imagemin-webpack/commit/6977f8f))

## 5.0.0 - 2019-07-04

- Changed: minimum required Node.js version is `8.9.0`.
- Changed: emit warning by default on no plugins for `imagemin`.
- Feature: simple configuration using `String` or `Array`, for example `{ imageminOptions: { plugins: ['mozjpeg']}}` or `{ imageminOptions: { plugins: [['mozjpeg', { quality: 60 ]]}}`.
- Fixed: fallback for cache directory when it can't be resolved.
- Fixed: cache invalidation when plugin options was changes or plugin version was updated.
- Perf: improve performance.

## 4.1.0 - 2019-01-23

- Feature: `filter` option.
- Feature: add `webp` and `tif` to `test` option by default.
- Fixed: don't break interpolated `[path]` on windows.
- Fixed: relax `node` version in `engines` field.
- Fixed: stop returning original file when the optimized file is larger.
- Fixed: optimize all images in multi compiler mode.

## 4.0.1 - 2018-11-14

- Fixed: use `afterPlugins` event for include `loader` (`minimizer` plugins don't have `afterPlugins` hook, bug in `webpack`).
- Fixed: don't add multiple `imagemin-loader` in multi compiler mode by default.
- Fixed: don't interpolate asset module name when `loader` is disabled (also don't include their in `manifest` option).

## 4.0.0 - 2018-11-13

- Changed: rename class `ImageminWebpackPlugin` to `ImageminPlugin`.
- Changed: change export `ImageminPlugin` and `imageminLoader` (Look on [Usage](https://github.com/itgalaxy/imagemin-webpack#usage)).
- Changed: plugin compresses all images with `loader: false` (previous version of plugin compresses only `emit` images)
- Changed: plugin auto includes `loader` as `pre` loader by default .
- Changed: drop support `webpack@3`.
- Chore: switch from `imagemin@5` to `imagemin@6`.
- Fixed: plugin auto include `loader` with `test`, `include` and `exclude` options.
- Fixed: `maxConcurrency` have right value on two core system.
- Fixed: default `maxConcurrency` value on system where `os.cpus()` is unavailable.
- Fixed: performance in some cases.

## 3.0.0 - 2018-04-17

- Added: `cache` options (i.e. persistent cache), by default is `false` (because it is good practice to disable `cache` by default).
- Changed: `imagemin-loader` now dynamically added in loaders list as `pre` loader (i.e. no need setup `imagemin-loader` in `webpack.config.js`).
- Changed: use `webpack` errors and warnings `api`.
- Changed: `imagemin` plugins for `loader` should be placed in `imageminOptions` options (look example in `README.md`).
- Chore: refactor all plugin code (all source code now in `src` directory).
- Deleted: `excludeChunksAssets` options (use `loader` options for plugin instead).
- Fixed: use `maxConcurrency`, use `os.cpus().length - 1` for multi core systems and `1` for single core system.
- Fixed: don't add same file paths in `manifest`.

## 2.0.0 - 2018-02-28

- Changed: use `ModuleFilenameHelpers.matchObject` for `test` option (only `regex` now allowed).
- Changed: Drop support for `node` v4.
- Changed: emit original file in plugin when image corrupted.
- Feature: `include` and `exclude` option for plugin.
- Fixed: compatibility with `webpack > 4.0.0`.
- Fixed: don't override `bail` from `compiler`.
- Fixed: use `callback` loader for handle `No plugins` error.
- Fixed: don't convert `Buffer` to `utf8` when `asset` is not `Buffer`.

## 1.1.2 - 2017-06-20

- Chore: support `webpack` v3.

## 1.1.1 - 2017-06-07

- Chore: minimum required `webpack-sources` version is now `^1.0.0`.

## 1.1.0 - 2017-03-15

- Added: supported `manifest` plugin option for export source and interpolated filenames.

## 1.0.1 - 2017-03-15

- Fixed: don't duplicate excluded assets, less memory usage.

## 1.0.0 - 2017-03-14

- Initial public release.
