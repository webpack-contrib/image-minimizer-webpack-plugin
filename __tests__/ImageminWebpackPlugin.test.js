import EmitPlugin from "./fixtures/EmitWepbackPlugin";
import { ImageminWebpackPlugin } from "..";
import basicWebpackConfig from "./fixtures/config";
import defaultsDeep from "lodash.defaultsdeep";
import fs from "fs";
import imagemin from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminSvgo from "imagemin-svgo";
import path from "path";
import pify from "pify";
import tempy from "tempy";
import test from "ava";
import webpack from "webpack";

const plugins = [
  imageminGifsicle(),
  imageminMozjpeg(),
  imageminPngquant(),
  imageminSvgo()
];
const fixturesPath = path.join(__dirname, "fixtures");

test("should execute successfully and optimize only emitted iamges", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);
  webpackConfig.plugins = [
    new EmitPlugin(),
    new ImageminWebpackPlugin({
      imageminOptions: {
        plugins
      },
      name: "[path][name]-compressed.[ext]"
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    const promises = [];
    const { warnings, errors, assets } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 0, "no compilation error");

    const testedNotOptimizedImages = [
      "test.gif",
      "test.jpg",
      "test.png",
      "test.svg"
    ];

    testedNotOptimizedImages.forEach(testedNotOptimizedImage => {
      t.true(typeof assets[testedNotOptimizedImage] === "object");
    });

    const testedOptimizedImages = ["emit-test.jpg"];

    testedOptimizedImages.forEach(testedOptimizedImage => {
      const testedImageName = `${path.basename(
        testedOptimizedImage,
        path.extname(testedOptimizedImage)
      )}-compressed${path.extname(testedOptimizedImage)}`;

      t.true(typeof assets[testedImageName] === "object");

      const pathToTestedImage = path.join(fixturesPath, testedOptimizedImage);

      promises.push(
        pify(fs.readFile)(pathToTestedImage)
          .then(data =>
            imagemin.buffer(data, {
              plugins
            })
          )
          .then(compressedtestedImage => {
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
});

test("should execute successfully and optimize all images", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        emitFile: true,
        name: "[path][name].[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);
  webpackConfig.plugins = [
    new EmitPlugin(),
    new ImageminWebpackPlugin({
      excludeChunksAssets: false,
      imageminOptions: {
        plugins
      },
      name: "[path][name]-compressed.[ext]"
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    const promises = [];
    const { warnings, errors, assets } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 0, "no compilation error");

    const testedImages = [
      "test.gif",
      "test.jpg",
      "test.png",
      "test.svg",
      "emit-test.jpg"
    ];

    testedImages.forEach(testedImage => {
      const testedImageName = `${path.basename(
        testedImage,
        path.extname(testedImage)
      )}-compressed${path.extname(testedImage)}`;

      t.true(
        typeof assets[testedImageName] === "object",
        "tested image exists in assets"
      );

      const pathToTestedImage = path.join(fixturesPath, testedImage);

      promises.push(
        pify(fs.readFile)(pathToTestedImage)
          .then(data =>
            imagemin.buffer(data, {
              plugins
            })
          )
          .then(compressedtestedImage => {
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
});

test("should execute successfully without any assets", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./empty-entry.js";
  webpackConfig.plugins = [
    new ImageminWebpackPlugin({
      bail: true,
      imageminOptions: {
        plugins
      }
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should throw errors if imagemin plugins don't setup", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./empty-entry.js";
  webpackConfig.plugins = [
    new EmitPlugin({
      filename: "test.jpg"
    }),
    new ImageminWebpackPlugin({
      bail: true,
      imageminOptions: {
        plugins: []
      }
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 1, "1 compilation errors");

    stats.compilation.errors.forEach(error => {
      t.regex(
        error.message,
        /No\splugins\sfound\sfor\s`imagemin`/,
        "message error"
      );
    });

    return stats;
  });
});

test("should throw errors on corrupted images using `plugin.bail: true` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./empty-entry.js";
  webpackConfig.plugins = [
    new EmitPlugin({
      filename: "test-corrupted.jpg"
    }),
    new ImageminWebpackPlugin({
      bail: true,
      imageminOptions: {
        plugins
      }
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 1, "no compilation error");
    t.regex(stats.compilation.errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should throw errors on corrupted images using `webpack.bail: true` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      bail: true,
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.bail = true;
  webpackConfig.entry = "./empty-entry.js";
  webpackConfig.plugins = [
    new EmitPlugin({
      filename: "test-corrupted.jpg"
    }),
    new ImageminWebpackPlugin({
      imageminOptions: {
        plugins
      }
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 1, "no compilation error");
    t.regex(stats.compilation.errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `plugin.bail: false` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./empty-entry.js";
  webpackConfig.plugins = [
    new EmitPlugin({
      filename: "test-corrupted.jpg"
    }),
    new ImageminWebpackPlugin({
      bail: false,
      imageminOptions: {
        plugins
      }
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 1, "1 compilation warnings");
    t.regex(stats.compilation.warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `webpack.bail: false` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      bail: false,
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.bail = false;
  webpackConfig.entry = "./empty-entry.js";
  webpackConfig.plugins = [
    new EmitPlugin({
      filename: "test-corrupted.jpg"
    }),
    new ImageminWebpackPlugin({
      imageminOptions: {
        plugins
      }
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 1, "1 compilation warnings");
    t.regex(stats.compilation.warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should execute successfully and contains not empty manifest", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );
  const manifest = {};

  webpackConfig.entry = "./empty-entry.js";
  webpackConfig.plugins = [
    new EmitPlugin({
      filename: "test.jpg"
    }),
    new ImageminWebpackPlugin({
      bail: true,
      imageminOptions: {
        plugins
      },
      manifest
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");
    t.deepEqual(manifest, {
      "test.jpg": "82bc921bd1ff78cfda2eee090ee32afd.jpg"
    });

    return stats;
  });
});
