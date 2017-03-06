import EmitPlugin from './fixtures/EmitWepbackPlugin';
import { ImageminWebpackPlugin } from '../index';
import basicWebpackConfig from './fixtures/config';
import defaultsDeep from 'lodash.defaultsdeep';
import fs from 'fs';
import imagemin from 'imagemin';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import path from 'path';
import pify from 'pify';
import test from 'ava';
import tmp from 'tmp';
import webpack from 'webpack';

const plugins = [
    imageminGifsicle(),
    imageminMozjpeg(),
    imageminPngquant(),
    imageminSvgo()
];
const fixturesPath = path.join(__dirname, 'fixtures');
const tmpDir = () => pify(tmp.dir, {
    multiArgs: true
})({
    unsafeCleanup: true
});

tmp.setGracefulCleanup();

test(
    'should execute successfully and optimize only emitted',
    (t) => tmpDir()
        .then((result) => {
            const [tmpPath, cleanupCallback] = result;
            const webpackConfig = defaultsDeep({
                output: {
                    path: `${tmpPath}`
                }
            }, basicWebpackConfig);

            webpackConfig.module.rules = webpackConfig.module.rules.concat([{
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                },
                test: /\.(jpe?g|png|gif|svg)$/i
            }]);
            webpackConfig.plugins = [
                new EmitPlugin(),
                new ImageminWebpackPlugin({
                    imageminOptions: {
                        plugins
                    },
                    name: '[path][name]-compressed.[ext]'
                })
            ];

            return pify(webpack)(webpackConfig)
                .then((stats) => {
                    const promises = [];

                    t.true(stats.compilation.errors.length === 0, 'no compilation error');

                    const { assets } = stats.compilation;

                    const testedNotOptimizedImages = ['test.gif', 'test.jpg', 'test.png', 'test.svg'];

                    testedNotOptimizedImages.forEach((testedNotOptimizedImage) => {
                        t.true(typeof assets[testedNotOptimizedImage] === 'object');
                    });

                    const testedOptimizedImages = ['emit-test.jpg'];

                    testedOptimizedImages.forEach((testedOptimizedImage) => {
                        const testedImageName = `${path.basename(
                            testedOptimizedImage,
                            path.extname(testedOptimizedImage)
                        )}-compressed${path.extname(testedOptimizedImage)}`;

                        t.true(typeof assets[testedImageName] === 'object');

                        const pathToTestedImage = path.join(fixturesPath, testedOptimizedImage);

                        promises.push(
                            pify(fs.readFile)(pathToTestedImage)
                                .then((data) => imagemin.buffer(data, {
                                    plugins
                                }))
                                .then((compressedtestedImage) => {
                                    t.true(
                                        compressedtestedImage.length === assets[testedImageName].size(),
                                        `the image ${pathToTestedImage} is compressed`
                                    );

                                    return true;
                                })
                        );
                    });

                    return Promise.all(promises).then(() => cleanupCallback());
                });
        })
);

test(
    'should execute successfully and optimize all images',
    (t) => tmpDir()
        .then((result) => {
            const [tmpPath, cleanupCallback] = result;
            const webpackConfig = defaultsDeep({
                output: {
                    path: `${tmpPath}`
                }
            }, basicWebpackConfig);

            webpackConfig.module.rules = webpackConfig.module.rules.concat([{
                loader: 'file-loader',
                options: {
                    emitFile: true,
                    name: '[path][name].[ext]'
                },
                test: /\.(jpe?g|png|gif|svg)$/i
            }]);
            webpackConfig.plugins = [
                new EmitPlugin(),
                new ImageminWebpackPlugin({
                    excludeChunksAssets: false,
                    imageminOptions: {
                        plugins
                    },
                    name: '[path][name]-compressed.[ext]'
                })
            ];

            return pify(webpack)(webpackConfig)
                .then((stats) => {
                    const promises = [];

                    t.true(stats.compilation.errors.length === 0, 'no compilation error');

                    const { assets } = stats.compilation;
                    const testedImages = ['test.gif', 'test.jpg', 'test.png', 'test.svg', 'emit-test.jpg'];

                    testedImages.forEach((testedImage) => {
                        const testedImageName = `${path.basename(
                            testedImage,
                            path.extname(testedImage)
                        )}-compressed${path.extname(testedImage)}`;

                        t.true(
                            typeof assets[testedImageName] === 'object',
                            'tested image exists in assets'
                        );
                        const pathToTestedImage = path.join(fixturesPath, testedImage);

                        promises.push(
                            pify(fs.readFile)(pathToTestedImage)
                                .then((data) => imagemin.buffer(data, {
                                    plugins
                                }))
                                .then((compressedtestedImage) => {
                                    t.true(
                                        compressedtestedImage.length === assets[testedImageName].size(),
                                        `the image ${pathToTestedImage} is compressed`
                                    );

                                    return true;
                                })
                        );
                    });

                    return Promise.all(promises).then(() => cleanupCallback());
                });
        })
);

test(
    'should throw the error if imagemin plugins don\'t setup',
    (t) => {
        t.throws(() => new ImageminWebpackPlugin(), /No\splugins\sfound\sfor\simagemin/);
    }
);

test(
    'should throw error on corrupted images using `plugin.bail` option',
    (t) => {
        t.throws(tmpDir()
            .then((result) => {
                const [tmpPath, cleanupCallback] = result;

                const webpackConfig = defaultsDeep({
                    output: {
                        path: `${tmpPath}`
                    }
                }, basicWebpackConfig);

                webpackConfig.entry = './empty-entry.js';
                webpackConfig.plugins = [
                    new EmitPlugin({
                        filename: 'test-corrupted.jpg'
                    }),
                    new ImageminWebpackPlugin({
                        bail: true,
                        imageminOptions: {
                            plugins
                        }
                    })
                ];

                return pify(webpack)(webpackConfig)
                    .catch((error) => {
                        cleanupCallback();

                        throw error;
                    });
            }),
            /Corrupt\sJPEG\sdata/
        );
    }
);

test(
    'should throw the error on corrupted images using `webpack.bail` option',
    (t) => {
        t.throws(tmpDir()
            .then((result) => {
                const [tmpPath, cleanupCallback] = result;

                const webpackConfig = defaultsDeep({
                    output: {
                        path: `${tmpPath}`
                    }
                }, basicWebpackConfig);

                webpackConfig.bail = true;
                webpackConfig.entry = './empty-entry.js';
                webpackConfig.plugins = [
                    new EmitPlugin({
                        filename: 'test-corrupted.jpg'
                    }),
                    new ImageminWebpackPlugin({
                        imageminOptions: {
                            plugins
                        }
                    })
                ];

                return pify(webpack)(webpackConfig)
                    .catch((error) => {
                        cleanupCallback();

                        throw error;
                    });
            }),
            /Corrupt\sJPEG\sdata/
        );
    }
);

test(
    'should execute successfully and ignore corrupted images using `plugin.bail` option',
    (t) => tmpDir()
        .then((result) => {
            const [tmpPath, cleanupCallback] = result;
            const webpackConfig = defaultsDeep({
                output: {
                    path: `${tmpPath}`
                }
            }, basicWebpackConfig);

            webpackConfig.entry = './empty-entry.js';
            webpackConfig.plugins = [
                new EmitPlugin({
                    filename: 'test-corrupted.jpg'
                }),
                new ImageminWebpackPlugin({
                    bail: false,
                    imageminOptions: {
                        plugins
                    }
                })
            ];

            return pify(webpack)(webpackConfig)
                .then((stats) => {
                    t.true(stats.compilation.errors.length === 0, 'no compilation error');

                    return cleanupCallback;
                });
        })
);

test(
    'should execute successfully and ignore corrupted images using `webpack.bail` option',
    (t) => tmpDir()
        .then((result) => {
            const [tmpPath, cleanupCallback] = result;
            const webpackConfig = defaultsDeep({
                output: {
                    path: `${tmpPath}`
                }
            }, basicWebpackConfig);

            webpackConfig.bail = false;
            webpackConfig.entry = './empty-entry.js';
            webpackConfig.plugins = [
                new EmitPlugin({
                    filename: 'test-corrupted.jpg'
                }),
                new ImageminWebpackPlugin({
                    imageminOptions: {
                        plugins
                    }
                })
            ];

            return pify(webpack)(webpackConfig)
                .then((stats) => {
                    t.true(stats.compilation.errors.length === 0, 'no compilation error');

                    return cleanupCallback;
                });
        })
);
