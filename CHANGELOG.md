# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.1.0](https://github.com/itgalaxy/imagemin-webpack/compare/v5.0.0...v5.1.0) (2019-07-23)


### Bug Fixes

* better handling configuration errors ([#114](https://github.com/itgalaxy/imagemin-webpack/issues/114)) ([6b192c2](https://github.com/itgalaxy/imagemin-webpack/commit/6b192c2))
* increase perf for filtered assets ([#118](https://github.com/itgalaxy/imagemin-webpack/issues/118)) ([32eae8c](https://github.com/itgalaxy/imagemin-webpack/commit/32eae8c))


### Features

* `normalizeConfig` api helper ([#119](https://github.com/itgalaxy/imagemin-webpack/issues/119)) ([6977f8f](https://github.com/itgalaxy/imagemin-webpack/commit/6977f8f))



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
