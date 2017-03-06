'use strict';

const os = require('os');
const RawSource = require('webpack-sources/lib/RawSource');
const imagemin = require('imagemin');
const createThrottle = require('async-throttle');
const nodeify = require('nodeify');
const minimatch = require('minimatch');

class ImageminWebpackPlugin {
    constructor(options = {}) {
        this.options = Object.assign({}, {
            imageminOptions: {
                plugins: []
            },
            maxConcurrency: os.cpus().length,
            test: /\.(jpe?g|png|gif|svg)$/i
        }, options);

        this.testRegexes = this.compileTestOption(this.options.test);

        this.testFile = (filename, regexes) => {
            for (const regex of regexes) {
                if (regex.test(filename)) {
                    return true;
                }
            }

            return false;
        };

        this.compileTestOption = (rawTestValue) => {
            const tests = Array.isArray(rawTestValue) ? rawTestValue : [rawTestValue];

            return tests.map((test) => {
                if (test instanceof RegExp) {
                    // If it's a regex, just return it
                    return test;
                } else if (typeof test === 'string') {
                    // If it's a string, let minimatch convert it to a regex
                    return minimatch.makeRe(test);
                }

                throw new Error('test parameter must be a regex, glob string, or an array of regexes or glob strings');
            });
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
            return imagemin.buffer(assetContents, imageminOptions)
                .then((optimizedAssetContents) => {
                    if (optimizedAssetContents.length < assetOrigSize) {
                        return new RawSource(optimizedAssetContents);
                    }

                    return asset;
                });
        };
    }

    apply(compiler) {
        // Access the assets once they have been assembled
        compiler.plugin('emit', (compilation, callback) => {
            const throttle = createThrottle(this.options.maxConcurrency);

            return nodeify(Promise.all(Array.map(compilation.assets, (asset, filename) => throttle(() => {
                // Skip the image if it's not a match for the regex
                if (this.testFile(filename, this.options.testRegexes)) {
                    compilation.assets[filename] = this.optimizeImage(asset, this.options.imageminOptions);
                }
            }))), callback);
        });
    }
}

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = ImageminWebpackPlugin;
