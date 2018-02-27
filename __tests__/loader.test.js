import basicWebpackConfig from "./fixtures/config";
import defaultsDeep from "lodash.defaultsdeep";
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

test("should execute successfully", t => {
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

  imageminRule.use[1].options.plugins = plugins;
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const promises = [];

    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    const { assets } = stats.compilation;
    const testedImages = ["test.gif", "test.jpg", "test.png", "test.svg"];

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

test("should throw the error if imagemin plugins don't setup", t => {
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

  webpackConfig.module.rules = webpackConfig.module.rules.concat(imageminRule);

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 4, "4 compilation error");

    stats.compilation.errors.forEach(error => {
      t.regex(
        error.message,
        /No\splugins\sfound\sfor\s`imagemin-loader`/,
        "message error"
      );
    });

    return stats;
  });
});

test("should throw the error on corrupted images using `loader.bail` option", t => {
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

  imageminRule.use[1].options.plugins = plugins;

  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);
  webpackConfig.module.rules[1].use[1].options.bail = true;

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 1, "no compilation error");
    t.regex(stats.compilation.errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should throw the error on corrupted images using `webpack.bail` option", t => {
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

  imageminRule.use[1].options.plugins = plugins;

  webpackConfig.bail = true;
  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 1, "no compilation error");
    t.regex(stats.compilation.errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should execute successfully and ignore corrupted images using `loader.bail` option", t => {
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

  imageminRule.use[1].options.plugins = plugins;

  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);
  webpackConfig.module.rules[1].use[1].options.bail = false;

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should execute successfully and ignore corrupted images using `webpack.bail` option", t => {
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

  imageminRule.use[1].options.plugins = plugins;

  webpackConfig.bail = false;
  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    imageminRule
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    t.true(stats.compilation.warnings.length === 0, "no compilation warnings");
    t.true(stats.compilation.errors.length === 0, "no compilation error");

    return stats;
  });
});
