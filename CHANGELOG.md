# Change Log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org).

## 3.0.0 - 2018-04-17

* Added: `cache` options (i.e. persistent cache), by default is `false` (because it is good practice to disable `cache` by default).
* Changed: `imagemin-loader` now dynamically added in loaders list as `pre` loader (i.e. no need setup `imagemin-loader` in `webpack.config.js`).
* Changed: use `webpack` errors and warnings `api`.
* Changed: `imagemin` plugins for `loader` should be placed in `imageminOptions` options (look example in `README.md`).
* Chore: refactor all plugin code (all source code now in `src` directory).
* Deleted: `excludeChunksAssets` options (use `loader` options for plugin instead).
* Fixed: use `maxConcurrency`, use `os.cpus().length - 1` for multi core systems and `1` for single core system.
* Fixed: don't add same file paths in `manifest`.

## 2.0.0 - 2018-02-28

* Changed: use `ModuleFilenameHelpers.matchObject` for `test` option (only `regex` now allowed).
* Changed: Drop support for `node` v4.
* Changed: emit original file in plugin when image corrupted.
* Feature: `include` and `exclude` option for plugin.
* Fixed: compatibility with `webpack > 4.0.0`.
* Fixed: don't override `bail` from `compiler`.
* Fixed: use `callback` loader for handle `No plugins` error.
* Fixed: don't convert `Buffer` to `utf8` when `asset` is not `Buffer`.

## 1.1.2 - 2017-06-20

* Chore: support `webpack` v3.

## 1.1.1 - 2017-06-07

* Chore: minimum required `webpack-sources` version is now `^1.0.0`.

## 1.1.0 - 2017-03-15

* Added: supported `manifest` plugin option for export source and interpolated filenames.

## 1.0.1 - 2017-03-15

* Fixed: don't duplicate excluded assets, less memory usage.

## 1.0.0 - 2017-03-14

* Initial public release.
