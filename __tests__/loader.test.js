import basicWebpackConfig from "./fixtures/config";
import cacache from "cacache";
import defaultsDeep from "lodash.defaultsdeep";
import del from "del";
import findCacheDir from "find-cache-dir";
import fs from "fs";
import imagemin from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import { imageminLoader } from "..";
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
const baseImageminRule = {
  test: /\.(jpe?g|png|gif|svg)$/i,
  use: [
    {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]"
      }
    },
    {
      loader: imageminLoader,
      options: {}
    }
  ]
};
const fixturesPath = path.join(__dirname, "fixtures");

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
  const imageminRule = defaultsDeep({}, baseImageminRule);

  imageminRule.use[1].options.imageminOptions = { plugins };
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const promises = [];
    const { warnings, errors, assets } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 0, "no compilation error");
    t.true(Object.keys(assets).length === 5, "5 assets");

    const testedImages = [
      "loader-test.gif",
      "loader-test.jpg",
      "loader-test.png",
      "loader-test.svg"
    ];

    testedImages.forEach(testedImage => {
      t.true(
        typeof assets[testedImage] === "object",
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
              compressedtestedImage.length === assets[testedImage].size(),
              `the image ${pathToTestedImage} is compressed`
            );

            return true;
          })
      );
    });

    return Promise.all(promises);
  });
});

test("should execute successfully, optimize all images and cache their", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );
  const imageminRule = defaultsDeep({}, baseImageminRule);

  imageminRule.use[1].options.imageminOptions = { plugins };
  imageminRule.use[1].options.cache = true;
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);

  const cacheDir = findCacheDir({ name: "imagemin-webpack" });

  return pify(webpack)(webpackConfig)
    .then(stats => {
      const promises = [];
      const { warnings, errors, assets } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 5, "5 assets");

      const testedImages = [
        "loader-test.gif",
        "loader-test.jpg",
        "loader-test.png",
        "loader-test.svg"
      ];

      testedImages.forEach(testedImage => {
        t.true(
          typeof assets[testedImage] === "object",
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
            .then(compressedTestedImage => {
              t.true(
                compressedTestedImage.length === assets[testedImage].size(),
                `the image ${pathToTestedImage} is compressed`
              );

              return true;
            })
        );
      });

      return Promise.all(promises);
    })
    .then(() =>
      cacache
        .ls(cacheDir)
        .then(cachedAssets => {
          t.true(Object.keys(cachedAssets).length === 4, "4 cached assets");

          return true;
        })
        .then(() => pify(webpack)(webpackConfig))
        .then(stats => {
          const { warnings, errors, assets } = stats.compilation;

          t.true(warnings.length === 0, "no compilation warnings");
          t.true(errors.length === 0, "no compilation error");
          t.true(Object.keys(assets).length === 5, "5 assets");

          return true;
        })
        .then(() => del(cacheDir))
    );
});

test("should throw errors if imagemin plugins don't setup", t => {
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
  const imageminRule = defaultsDeep({}, baseImageminRule);

  webpackConfig.module.rules = webpackConfig.module.rules.concat(imageminRule);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 4, "4 compilation errors");

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

test("should throw errors on corrupted images using `loader.bail: true` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );
  const imageminRule = defaultsDeep({}, baseImageminRule);

  imageminRule.use[1].options.imageminOptions = { plugins };

  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);
  webpackConfig.module.rules[1].use[1].options.bail = true;

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "no compilation error");
    t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should throw errors on corrupted images using `webpack.bail: true` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );
  const imageminRule = defaultsDeep({}, baseImageminRule);

  imageminRule.use[1].options.imageminOptions = { plugins };

  webpackConfig.bail = true;
  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "no compilation error");
    t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `loader.bail: false` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );
  const imageminRule = defaultsDeep({}, baseImageminRule);

  imageminRule.use[1].options.imageminOptions = { plugins };

  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);
  webpackConfig.module.rules[1].use[1].options.bail = false;

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 1, "no compilation warnings");
    t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `webpack.bail: false` option", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );
  const imageminRule = defaultsDeep({}, baseImageminRule);

  imageminRule.use[1].options.imageminOptions = { plugins };

  webpackConfig.bail = false;
  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 1, "no compilation warnings");
    t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(errors.length === 0, "no compilation error");

    return stats;
  });
});
