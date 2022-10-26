# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.7.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.6.1...v3.7.0) (2022-10-26)


### Features

* added `info.sourceFilename` ([f8b3378](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/f8b337833759835f3f67277c8bfab85986416de9))

### [3.6.1](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.6.0...v3.6.1) (2022-09-19)


### Bug Fixes

* fix resize option enabled flag (`squoosh`) ([#356](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/356)) ([b2a5015](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/b2a50151b9dcd9f79307695e52a2b12db72a0a7e))
* support for animated images (`sharp`) ([#358](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/358)) ([3c30355](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/3c3035536303f95cc74ebaed5247731789422965))
* throw an error on unsupported image formats (`sharp`) ([#359](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/359)) ([c0b193b](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/c0b193b38d4e488ca0651f2bea13065700cb3bf1))

## [3.6.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.5.0...v3.6.0) (2022-09-16)


### Features

* supported more resize options (only `sharp`) ([#355](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/355)) ([d365db3](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/d365db3db18476435cf8952aaa23801dd7e466ee))

## [3.5.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.4.0...v3.5.0) (2022-09-15)


### Features

* add `width`/`w` and `height`/`h` query parameters to resize image ([52ee1c8](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/52ee1c84cf935e2ebbf4bfe38567a0cb73bd6c13))


### Bug Fixes

* `implementation` types ([#353](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/353)) ([a57fcdf](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/a57fcdfc7121f1ceda178dd7987623433745b21e))

## [3.4.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.3.1...v3.4.0) (2022-09-09)


### Features

* add `[width]` and `[height]` placeholders for the `filename` option ([#346](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/346)) ([682c22b](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/682c22b81f2f1af96e83f0e0805fd5406a209324))


### Bug Fixes

* types ([cd7c7a7](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/cd7c7a7c7f12eb883399cf01ad7c9102e90b845b))

### [3.3.1](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.3.0...v3.3.1) (2022-09-05)


### Bug Fixes

* assets info for sharp ([#338](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/338)) ([c897d30](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/c897d30bed8532fec1312be62483281589402b0b))
* avoid renaming unsupported formats ([#339](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/339)) ([18e30ef](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/18e30ef3da70b39384f389e6729d56fb5b24af59))
* sharp types ([#337](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/337)) ([ae3a03b](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/ae3a03b926a6bce29dee2829490a99d16394a501))

## [3.3.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.2.3...v3.3.0) (2022-08-12)


### Features

* add `sharp` minifier/generator implementation ([#329](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/329)) ([5c440f6](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/5c440f6e8257fe0a4ebabcbe22a09063902a6c5e))

### [3.2.3](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.2.2...v3.2.3) (2022-01-13)


### Bug Fixes

* types ([#297](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/297)) ([c61642f](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/c61642f85b9dc17d45d79a42760c48fe41ffcd27))

### [3.2.2](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.2.1...v3.2.2) (2022-01-07)


### Bug Fixes

* perf for `squoosh` ([#295](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/295)) ([2f4d1a2](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/2f4d1a291e30b737ebff118804f7fee93c90fcd1))

### [3.2.1](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.2.0...v3.2.1) (2022-01-03)


### Bug Fixes

* memory leaking ([#293](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/293)) ([043e571](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/043e57114d701cf9dfe87b9dda3b185b99cbd399))
* respect encoding of data uri ([#294](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/294)) ([a89b316](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/a89b3164a41f403a2a48d18cb7f9b92353dd18b7))

## [3.2.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.1.2...v3.2.0) (2021-12-25)


### Features

* allow generating images from copied assets using the `type` option for the `generator` option ([fab9103](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/fab910337ef3c119f991f0d71c682d5ab3a65b5c))

### [3.1.2](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.1.1...v3.1.2) (2021-12-17)


### Bug Fixes

* improve perf ([#285](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/285)) ([435879d](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/435879dd74528850e0ade0ec24c9db968cbc7344))

### [3.1.1](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.1.0...v3.1.1) (2021-12-17)


### Bug Fixes

* ignore unsupported data URI by mime type ([#284](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/284)) ([d1b68c2](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/d1b68c204ab604b37effc6614e939e2e36662095))

## [3.1.0](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.0.1...v3.1.0) (2021-12-16)


### Features

* removed cjs wrapper and generated types in commonjs format (`export =` and `namespaces` used in types), now you can directly use exported types ([#282](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/282)) ([f0fa0a7](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/f0fa0a7fb2531d9e78e37778dae5c0b267724c1b))

### [3.0.1](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/compare/v3.0.0...v3.0.1) (2021-12-07)


### Bug Fixes

* reduced memory consumption for `squoosh` ([#279](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/issues/279)) ([0d597b7](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/0d597b751ca5eda293929ce8d71349572fbf0fb8))
* types ([028fad3](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/commit/028fad3403c890d691ebd636c7f55f6bf801a3b7))

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
