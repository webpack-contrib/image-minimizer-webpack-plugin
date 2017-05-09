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
import tempy from 'tempy';
import test from 'ava';
import webpack from 'webpack';

const plugins = [
    imageminGifsicle(),
    imageminMozjpeg(),
    imageminPngquant(),
    imageminSvgo()
];
const fixturesPath = path.join(__dirname, 'fixtures');

test(
    'should execute successfully and optimize only emitted',
    (t) => {
        const tmpDirectory = tempy.directory();
        const webpackConfig = defaultsDeep({
            output: {
                path: tmpDirectory
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

                return Promise.all(promises);
            });
    }
);

test(
    'should execute successfully and optimize all images',
    (t) => {
        const tmpDirectory = tempy.directory();
        const webpackConfig = defaultsDeep({
            output: {
                path: tmpDirectory
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

                return Promise.all(promises);
            });
    }
);

test(
    'should throw the error if imagemin plugins don\'t setup',
    (t) => t.throws(() => new ImageminWebpackPlugin(), /No\splugins\sfound\sfor\simagemin/)
);

test(
    'should throw error on corrupted images using `plugin.bail` option',
    (t) => {
        const tmpDirectory = tempy.directory();
        const webpackConfig = defaultsDeep({
            output: {
                path: tmpDirectory
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

        return t.throws(pify(webpack)(webpackConfig), /Corrupt\sJPEG\sdata/);
    }
);

test(
    'should throw the error on corrupted images using `webpack.bail` option',
    (t) => {
        const tmpDirectory = tempy.directory();
        const webpackConfig = defaultsDeep({
            bail: true,
            output: {
                path: tmpDirectory
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

        return t.throws(pify(webpack)(webpackConfig), /Corrupt\sJPEG\sdata/);
    }
);

test(
    'should execute successfully and ignore corrupted images using `plugin.bail` option',
    (t) => {
        const tmpDirectory = tempy.directory();
        const webpackConfig = defaultsDeep({
            output: {
                path: tmpDirectory
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

                return stats;
            });
    }
);

test(
    'should execute successfully and ignore corrupted images using `webpack.bail` option',
    (t) => {
        const tmpDirectory = tempy.directory();
        const webpackConfig = defaultsDeep({
            output: {
                path: tmpDirectory
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

                return stats;
            });
    }
);
