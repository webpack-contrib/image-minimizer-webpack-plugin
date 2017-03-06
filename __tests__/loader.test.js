import basicWebpackConfig from './fixtures/config';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import pify from 'pify';
import test from 'ava';
import tmp from 'tmp';
import webpack from 'webpack';

tmp.setGracefulCleanup();

test.only(
    'should execute successfully',
    (t) => pify(tmp.dir, {
        multiArgs: true
    })({
        unsafeCleanup: true
    })
        .then((result) => {
            const [tmpPath, cleanupCallback] = result;

            const webpackConfig = Object.assign({}, basicWebpackConfig, {
                output: {
                    path: `${tmpPath}`
                }
            });

            webpackConfig.module.rules[0].use[1].options = {
                plugins: [
                    imageminGifsicle(),
                    imageminMozjpeg(),
                    imageminPngquant(),
                    imageminSvgo()
                ]
            };

            return pify(webpack)(webpackConfig)
                .then((stats) => {
                    t.true(stats.compilation.errors.length === 0, 'no compilation error');

                    // console.log(stats.compilation.assets);
                    // process.exit();

                    return cleanupCallback();
                });
        })
);

test(
    'should throw error if plugins don\'t setup',
    (t) => pify(tmp.dir, {
        multiArgs: true
    })({
        unsafeCleanup: true
    })
        .then((result) => {
            const [tmpPath, cleanupCallback] = result;

            const webpackConfig = Object.assign({}, basicWebpackConfig, {
                output: {
                    path: `${tmpPath}`
                }
            });

            return pify(webpack)(webpackConfig)
                .then((stats) => {
                    t.true(stats.compilation.errors.length === 4, '4 compilation error');

                    stats.compilation.errors.forEach((error) => {
                        t.regex(error.message, /No\splugins\sfound\sfor\simagemin/, 'message error');
                    });

                    return cleanupCallback();
                });
        })
);
