# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v2.2.0...v3.0.0) (2021-12-05)

There are a lot of breaking changes, the plugin has been completely rewritten, see the documentation for information and examples.

### ⚠ BREAKING CHANGES

* minimum supported Node.js version is `12.13.0`, `imagemin` uses dynamic `import()` to load plugins, so your Node.js version should support it
* by default, we don't install `imagemin`, so you need to run `npm i -D imagemin` to install `imagemin`
* union `minify` and `minizerOptions` in one option - `minimizer`, you can use `minimizer.implementation` and `minimizer.options` to specify minimizer and options
* image generation was rewritten, please use the `generator` option to configure image generation and use `new URL("./image.png?as=webp")`/`div {  backgaround: url("./image.png?as=webp"); }`/etc in code to enable it (`import` and `require` are supported too)
* `filter` and `filename` option was moved in the `minimizer`/`generator` option
* `imageminNormalizeConfig` is now async function
* default value of the `severityError` option is `"error"`, removed values: `true`, `false` and `auto`
* don't add `.` (dot) before `[ext]` in the `filename` option

### Features

* added `squoosh` support
* added the `minimizer` option for image optimization
* added the `generator` option for image generation
* added ability to use multiple `minimizer` option feature
* allow the `filename` option will be `Function`
* improve error reporting
* improve types
* output helpful descriptions and links on errors
* improve stats output

### Bug Fixes

* support esm `imagemin` plugin
* supports absolute URLs, i.e. `data:`/`http:`/`https:`/`file:`
* double minification and memory leak
* respect original errors
* compatibility with asset modules

## [2.2.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v2.1.0...v2.2.0) (2021-01-09)


### Features

* run optimize image assets added later by plugins ([#178](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/178)) ([4939f93](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/4939f93a55962c5812a693acc5eb441b78fe663c))

## [2.1.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v2.0.0...v2.1.0) (2020-12-23)


### Features

* add TypeScript definitions ([e78497b](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/e78497b3f50d2cfc6368fcdc9de548a7ad76f559))

## 2.0.0 (2020-12-17)


### ⚠ BREAKING CHANGES

* minimum supported `webpack` version is `5.1.0`
* removed the `cache` option in favor the [`cache`](https://webpack.js.org/configuration/other-options/#cache) option from webpack
 
## 1.0.0 (2020-10-07)

Initial release.
