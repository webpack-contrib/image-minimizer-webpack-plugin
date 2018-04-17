import EmitPlugin from "./fixtures/EmitWepbackPlugin";
import { ImageminWebpackPlugin } from "..";
import basicWebpackConfig from "./fixtures/config";
import cacache from "cacache";
import defaultsDeep from "lodash.defaultsdeep";
import del from "del";
import findCacheDir from "find-cache-dir";
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
  imageminGifsicle({
    foo: "bar"
  }),
  imageminMozjpeg(),
  imageminPngquant(),
  imageminSvgo()
];
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

  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        emitFile: true,
        name: "[path][name]-compressed.[ext]"
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
    t.true(Object.keys(assets).length === 6, "6 assets");

    const testedImages = [
      "loader-test.gif",
      "loader-test.jpg",
      "loader-test.png",
      "loader-test.svg",
      "plugin-test.jpg"
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
          .then(compressedTestedImage => {
            t.true(
              compressedTestedImage.length === assets[testedImageName].size(),
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

  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        emitFile: true,
        name: "[path][name]-compressed.[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);
  webpackConfig.plugins = [
    new EmitPlugin(),
    new ImageminWebpackPlugin({
      cache: true,
      imageminOptions: {
        plugins
      },
      name: "[path][name]-compressed.[ext]"
    })
  ];

  const cacheDir = findCacheDir({ name: "imagemin-webpack" });

  // Rewrite tests on mock when migrate on jest
  return Promise.resolve()
    .then(() => del(cacheDir))
    .then(() => pify(webpack)(webpackConfig))
    .then(stats => {
      const promises = [];
      const { warnings, errors, assets } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 6, "6 assets");

      const testedImages = [
        "loader-test.gif",
        "loader-test.jpg",
        "loader-test.png",
        "loader-test.svg",
        "plugin-test.jpg"
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
            .then(compressedTestedImage => {
              t.true(
                compressedTestedImage.length === assets[testedImageName].size(),
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
          t.true(Object.keys(cachedAssets).length === 5, "5 cached assets");

          return true;
        })
        .then(() => pify(webpack)(webpackConfig))
        .then(stats => {
          const { warnings, errors, assets } = stats.compilation;

          t.true(warnings.length === 0, "no compilation warnings");
          t.true(errors.length === 0, "no compilation error");
          t.true(Object.keys(assets).length === 6, "6 assets");

          return true;
        })
        .then(() => del(cacheDir))
    );
});

test("should execute successfully and optimize only emitted images from other plugins (standalone plugin)", t => {
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
      imageminOptions: {
        plugins
      },
      loader: false,
      name: "[path][name]-compressed.[ext]"
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    const promises = [];
    const { warnings, errors, assets } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 0, "no compilation error");
    t.true(Object.keys(assets).length === 6, "6 assets");

    const testedNotOptimizedImages = [
      "loader-test.gif",
      "loader-test.jpg",
      "loader-test.png",
      "loader-test.svg"
    ];

    testedNotOptimizedImages.forEach(testedNotOptimizedImage => {
      t.true(typeof assets[testedNotOptimizedImage] === "object");
    });

    const testedOptimizedImages = ["plugin-test.jpg"];

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
    const { warnings, errors, assets } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 0, "no compilation error");
    t.true(Object.keys(assets).length === 1, "1 asset");

    return stats;
  });
});

test("should throw errors if imagemin plugins don't setup (plugin)", t => {
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
      filename: "plugin-test.jpg"
    }),
    new ImageminWebpackPlugin({
      bail: true,
      imageminOptions: {
        plugins: []
      }
    })
  ];

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "1 compilation errors");

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

test("should throw errors if imagemin plugins don't setup (loader)", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./single-image-loader.js";
  webpackConfig.plugins = [
    new ImageminWebpackPlugin({
      bail: true,
      imageminOptions: {
        plugins: []
      }
    })
  ];
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "1 compilation errors");

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

test("should throw errors on corrupted images using `plugin.bail: true` option (plugin)", t => {
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
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "no compilation error");
    t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should throw errors on corrupted images using `plugin.bail: true` option (loader)", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.plugins = [
    new ImageminWebpackPlugin({
      bail: true,
      imageminOptions: {
        plugins
      }
    })
  ];
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "no compilation error");
    t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should throw errors on corrupted images using `webpack.bail: true` option (plugin)", t => {
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
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "no compilation error");
    t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should throw errors on corrupted images using `webpack.bail: true` option (loader)", t => {
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
  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.plugins = [
    new ImageminWebpackPlugin({
      imageminOptions: {
        plugins
      }
    })
  ];
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 1, "no compilation error");
    t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `plugin.bail: false` option (plugin)", t => {
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
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 1, "1 compilation warnings");
    t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `plugin.bail: false` option (loader)", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.plugins = [
    new ImageminWebpackPlugin({
      bail: false,
      imageminOptions: {
        plugins
      }
    })
  ];
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 1, "1 compilation warnings");
    t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `webpack.bail: false` option (plugin)", t => {
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
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 1, "1 compilation warnings");
    t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(errors.length === 0, "no compilation error");

    return stats;
  });
});

test("should execute successfully and throw warnings on corrupted images using `webpack.bail: false` option (loader)", t => {
  const tmpDirectory = tempy.directory();
  const webpackConfig = defaultsDeep(
    {
      output: {
        path: tmpDirectory
      }
    },
    basicWebpackConfig
  );

  webpackConfig.entry = "./loader-corrupted.js";
  webpackConfig.plugins = [
    new ImageminWebpackPlugin({
      bail: false,
      imageminOptions: {
        plugins
      }
    })
  ];
  webpackConfig.module.rules = webpackConfig.module.rules.concat([
    {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]"
      },
      test: /\.(jpe?g|png|gif|svg)$/i
    }
  ]);

  return pify(webpack)(webpackConfig).then(stats => {
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 1, "1 compilation warnings");
    t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
    t.true(errors.length === 0, "no compilation error");

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
      filename: "plugin-test.jpg"
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
    const { warnings, errors } = stats.compilation;

    t.true(warnings.length === 0, "no compilation warnings");
    t.true(errors.length === 0, "no compilation error");
    t.deepEqual(manifest, {
      "plugin-test.jpg": "82bc921bd1ff78cfda2eee090ee32afd.jpg"
    });

    return stats;
  });
});
