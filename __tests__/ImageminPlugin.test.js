import { fixturesPath, isCompressed, plugins, runWebpack } from "./helpers";
import cacache from "cacache";
import del from "del";
import findCacheDir from "find-cache-dir";
import path from "path";
import tempy from "tempy";
import test from "ava";

test("should optimizes all images (loader + plugin)", t =>
  Promise.resolve()
    .then(() => runWebpack({ emitPlugin: true, imageminPlugin: true }))
    .then(stats => {
      const { warnings, errors, assets } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 6, "6 assets");

      return isCompressed(
        [
          "loader-test.gif",
          "loader-test.jpg",
          "loader-test.png",
          "loader-test.svg",
          "plugin-test.jpg"
        ],
        assets
      );
    }));

test.serial(
  "should optimizes all images and cache their (loader + plugin)",
  t => {
    const cacheDir = findCacheDir({ name: "imagemin-webpack" });
    const output = tempy.directory();

    // Rewrite tests on mock when migrate on jest
    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        runWebpack({
          emitPlugin: true,
          imageminPluginOptions: {
            cache: true,
            imageminOptions: { plugins },
            name: "[path][name].[ext]"
          },
          output: { path: output }
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        t.true(warnings.length === 0, "no compilation warnings");
        t.true(errors.length === 0, "no compilation error");
        t.true(Object.keys(assets).length === 6, "6 assets");

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg",
            "plugin-test.jpg"
          ],
          assets
        );
      })
      .then(() =>
        cacache
          .ls(cacheDir)
          .then(cachedAssets => {
            // We handle 5 images, but `plugin-test.jpg` and `loader-test.jpg` are same
            // some we have only 4 compressed cached assets
            t.true(Object.keys(cachedAssets).length === 4, "4 cached assets");

            return true;
          })
          .then(() =>
            runWebpack({
              emitPlugin: true,
              imageminPluginOptions: {
                cache: true,
                imageminOptions: { plugins },
                name: "[path][name].[ext]"
              },
              output: { path: output }
            })
          )
          .then(stats => {
            const { warnings, errors, assets } = stats.compilation;

            t.true(warnings.length === 0, "no compilation warnings");
            t.true(errors.length === 0, "no compilation error");
            t.true(Object.keys(assets).length === 6, "6 assets");

            return true;
          })
          .then(() => del(cacheDir))
      );
  }
);

test.serial(
  "should optimizes all images and cache their (custom cache location) (loader + plugin)",
  t => {
    const cacheDir = findCacheDir({ name: "imagemin-plugin-cache-location" });
    const output = tempy.directory();

    // Rewrite tests on mock when migrate on jest
    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        runWebpack({
          emitPlugin: true,
          imageminPluginOptions: {
            cache: cacheDir,
            imageminOptions: { plugins },
            name: "[path][name].[ext]"
          },
          output: { path: output }
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        t.true(warnings.length === 0, "no compilation warnings");
        t.true(errors.length === 0, "no compilation error");
        t.true(Object.keys(assets).length === 6, "6 assets");

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg",
            "plugin-test.jpg"
          ],
          assets
        );
      })
      .then(() =>
        cacache
          .ls(cacheDir)
          .then(cachedAssets => {
            // We handle 5 images, but `plugin-test.jpg` and `loader-test.jpg` are same
            // some we have only 4 compressed cached assets
            t.true(Object.keys(cachedAssets).length === 4, "4 cached assets");

            return true;
          })
          .then(() =>
            runWebpack({
              emitPlugin: true,
              imageminPluginOptions: {
                cache: cacheDir,
                imageminOptions: { plugins },
                name: "[path][name].[ext]"
              },
              output: { path: output }
            })
          )
          .then(stats => {
            const { warnings, errors, assets } = stats.compilation;

            t.true(warnings.length === 0, "no compilation warnings");
            t.true(errors.length === 0, "no compilation error");
            t.true(Object.keys(assets).length === 6, "6 assets");

            return true;
          })
          .then(() => del(cacheDir))
      );
  }
);

test.serial(
  "should optimizes all images and doesn't cache their (loader + plugin)",
  t => {
    const cacheDir = findCacheDir({ name: "imagemin-webpack" });
    const output = tempy.directory();

    // Rewrite tests on mock when migrate on jest
    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        runWebpack({
          emitPlugin: true,
          imageminPluginOptions: {
            cache: false,
            imageminOptions: { plugins },
            name: "[path][name].[ext]"
          },
          output: { path: output }
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        t.true(warnings.length === 0, "no compilation warnings");
        t.true(errors.length === 0, "no compilation error");
        t.true(Object.keys(assets).length === 6, "6 assets");

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg",
            "plugin-test.jpg"
          ],
          assets
        );
      })
      .then(() =>
        cacache
          .ls(cacheDir)
          .then(cachedAssets => {
            t.true(Object.keys(cachedAssets).length === 0, "0 cached assets");

            return true;
          })
          .then(() =>
            runWebpack({
              emitPlugin: true,
              imageminPluginOptions: {
                cache: false,
                imageminOptions: { plugins },
                name: "[path][name].[ext]"
              },
              output: { path: output }
            })
          )
          .then(stats => {
            const { warnings, errors, assets } = stats.compilation;

            t.true(warnings.length === 0, "no compilation warnings");
            t.true(errors.length === 0, "no compilation error");
            t.true(Object.keys(assets).length === 6, "6 assets");

            return true;
          })
          .then(() => del(cacheDir))
      );
  }
);

test("should optimizes all images (plugin standalone)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        emitPlugin: true,
        imageminPluginOptions: {
          imageminOptions: { plugins },
          loader: false,
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { warnings, errors, assets } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 6, "6 assets");

      return isCompressed(
        [
          "loader-test.gif",
          "loader-test.jpg",
          "loader-test.png",
          "loader-test.svg",
          "plugin-test.jpg"
        ],
        assets
      );
    }));

test("should optimizes successfully without any assets", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        entry: path.join(fixturesPath, "empty-entry.js"),
        imageminPlugin: true
      })
    )
    .then(stats => {
      const { warnings, errors, assets } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 1, "1 asset");

      return stats;
    }));

test("should throws errors if imagemin plugins don't setup (by plugin)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        emitPlugin: true,
        entry: path.join(fixturesPath, "empty-entry.js"),
        imageminPluginOptions: {
          imageminOptions: {
            plugins: []
          }
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 1, "1 compilation errors");
      t.true(Object.keys(assets).length === 2, "2 assets");

      errors.forEach(error => {
        t.regex(
          error.message,
          /No\splugins\sfound\sfor\s`imagemin`/,
          "message error"
        );
      });

      return stats;
    }));

test("should throws errors if imagemin plugins don't setup (by loader)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        entry: path.join(fixturesPath, "single-image-loader.js"),
        imageminPluginOptions: {
          imageminOptions: {
            plugins: []
          }
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 1, "1 compilation errors");
      t.true(Object.keys(assets).length === 2, "2 assets");

      stats.compilation.errors.forEach(error => {
        t.regex(
          error.message,
          /No\splugins\sfound\sfor\s`imagemin`/,
          "message error"
        );
      });

      return stats;
    }));

test("should optimizes images and throws error on corrupted images using `plugin.bail` option with `true` value (by plugin)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        emitPluginOptions: {
          fileNames: ["test-corrupted.jpg", "plugin-test.png"]
        },
        entry: path.join(fixturesPath, "empty-entry.js"),
        imageminPluginOptions: {
          bail: true,
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 1, "no compilation error");
      t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["plugin-test.png"], assets);
    }));

test("should optimizes images and throws errors on corrupted images using `plugin.bail` option with `true` value (by loader)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        entry: path.join(fixturesPath, "loader-corrupted.js"),
        imageminPluginOptions: {
          bail: true,
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 1, "no compilation error");
      t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["loader-test.png"], assets);
    }));

test("should optimizes images and throws warning on corrupted images using `plugin.bail` option with `false` value (by plugin)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        emitPluginOptions: {
          fileNames: ["test-corrupted.jpg", "plugin-test.png"]
        },
        entry: path.join(fixturesPath, "empty-entry.js"),
        imageminPluginOptions: {
          bail: false,
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 1, "1 compilation warnings");
      t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["plugin-test.png"], assets);
    }));

test("should optimizes images and throws errors on corrupted images using `plugin.bail` option with `false` value (by loader)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        entry: path.join(fixturesPath, "loader-corrupted.js"),
        imageminPluginOptions: {
          bail: false,
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 1, "1 compilation warnings");
      t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["loader-test.png"], assets);
    }));

test("should optimizes images and throws errors on corrupted images using `webpack.bail` option with `true` value (by plugin)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        bail: true,
        emitPluginOptions: {
          fileNames: ["test-corrupted.jpg", "plugin-test.png"]
        },
        entry: path.join(fixturesPath, "empty-entry.js"),
        imageminPluginOptions: {
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 1, "no compilation error");
      t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["plugin-test.png"], assets);
    }));

test("should optimizes images and throws warning on corrupted images using `webpack.bail` option with `true` value (by loader)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        bail: true,
        entry: path.join(fixturesPath, "loader-corrupted.js"),
        imageminPluginOptions: {
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 1, "no compilation error");
      t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["loader-test.png"], assets);
    }));

test("should optimizes images and throw warnings on corrupted images using `webpack.bail` option with `false` value (by plugin)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        bail: false,
        emitPluginOptions: {
          fileNames: ["test-corrupted.jpg", "plugin-test.png"]
        },
        entry: path.join(fixturesPath, "empty-entry.js"),
        imageminPluginOptions: {
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 1, "1 compilation warnings");
      t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["plugin-test.png"], assets);
    }));

test("should optimizes images and throw warnings on corrupted images using `webpack.bail` option with `false` value (by loader)", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        bail: false,
        entry: path.join(fixturesPath, "loader-corrupted.js"),
        imageminPluginOptions: {
          imageminOptions: {
            plugins
          }
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 1, "1 compilation warnings");
      t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["loader-test.png"], assets);
    }));

test("should optimizes images and contains not empty manifest", t => {
  const manifest = {};

  return Promise.resolve()
    .then(() =>
      runWebpack({
        emitPlugin: true,
        entry: path.join(fixturesPath, "single-image-loader.js"),
        imageminPluginOptions: {
          imageminOptions: {
            plugins
          },
          manifest
        }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 3, "3 assets");
      t.deepEqual(manifest, {
        "plugin-test.jpg": "82bc921bd1ff78cfda2eee090ee32afd.jpg"
      });

      return stats;
    });
});
