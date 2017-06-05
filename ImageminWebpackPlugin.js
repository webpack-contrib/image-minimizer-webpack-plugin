'use strict';

const os = require('os');
const RawSource = require('webpack-sources/lib/RawSource');
const imagemin = require('imagemin');
const createThrottle = require('async-throttle');
const nodeify = require('nodeify');
const compileTestOption = require('./utils/compile-test-option');
const interpolateName = require('./utils/interpolate-name');

class ImageminWebpackPlugin {
    constructor(options = {}) {
        this.options = Object.assign(
            {},
            {
                bail: false,
                excludeChunksAssets: true,
                imageminOptions: {
                    plugins: []
                },
                manifest: null,
                maxConcurrency: os.cpus().length,
                name: '[hash].[ext]',
                test: /\.(jpe?g|png|gif|svg)$/i
            },
            options
        );

        if (
            !this.options.imageminOptions ||
            !this.options.imageminOptions.plugins ||
            this.options.imageminOptions.plugins.length === 0
        ) {
            throw new Error('No plugins found for imagemin');
        }

        this.testFile = (filename, regexes) => {
            for (const regex of regexes) {
                if (regex.test(filename)) {
                    return true;
                }
            }

            return false;
        };

        this.optimizeImage = (asset, imageminOptions) => {
            // Grab the orig source and size
            const assetSource = asset.source();
            const assetOrigSize = asset.size();

            // Ensure that the contents i have are in the form of a buffer
            const assetContents = Buffer.isBuffer(assetSource)
                ? assetSource
                : Buffer.from(assetSource, 'utf8');

            // Await for imagemin to do the compression
            return imagemin
                .buffer(assetContents, imageminOptions)
                .then(optimizedAssetContents => {
                    if (optimizedAssetContents.length < assetOrigSize) {
                        return new RawSource(optimizedAssetContents);
                    }

                    return asset;
                });
        };

        this.testRegexes = compileTestOption(this.options.test);
    }

    apply(compiler) {
        const excludeChunksAssets = [];

        if (compiler.options.bail) {
            this.options.bail = compiler.options.bail;
        }

        if (this.options.excludeChunksAssets) {
            compiler.plugin('compilation', compilation => {
                compilation.plugin('after-optimize-assets', assets => {
                    Object.keys(assets).forEach(name => {
                        if (
                            this.testFile(name, this.testRegexes) &&
                            excludeChunksAssets.indexOf(name) === -1
                        ) {
                            excludeChunksAssets.push(name);
                        }
                    });
                });
            });
        }

        compiler.plugin('emit', (compilation, callback) => {
            const { assets } = compilation;
            const throttle = createThrottle(this.options.maxConcurrency);

            return nodeify(
                Promise.all(
                    Object.keys(assets).map(filename =>
                        throttle(() => {
                            const asset = assets[filename];

                            if (excludeChunksAssets.indexOf(filename) !== -1) {
                                return Promise.resolve(asset);
                            }

                            // Skip the image if it's not a match for the regex
                            if (this.testFile(filename, this.testRegexes)) {
                                return this.optimizeImage(
                                    asset,
                                    this.options.imageminOptions
                                )
                                    .catch(error => {
                                        if (this.options.bail) {
                                            throw error;
                                        }

                                        return new RawSource('');
                                    })
                                    .then(compressedAsset => {
                                        const interpolatedName = interpolateName(
                                            filename,
                                            this.options.name,
                                            {
                                                content: compressedAsset.source()
                                            }
                                        );

                                        compilation.assets[
                                            interpolatedName
                                        ] = compressedAsset;

                                        if (interpolatedName !== filename) {
                                            delete compilation.assets[filename];
                                        }

                                        if (this.options.manifest) {
                                            this.options.manifest[
                                                filename
                                            ] = interpolatedName;
                                        }

                                        return Promise.resolve(compressedAsset);
                                    });
                            }

                            return Promise.resolve(asset);
                        })
                    )
                ),
                callback
            );
        });
    }
}

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminWebpackPlugin;
