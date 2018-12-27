import path from "path";
import cacache from "cacache";
import del from "del";
import findCacheDir from "find-cache-dir";
import tempy from "tempy";
import {
  fixturesPath,
  isCompressed,
  modulesHasImageminLoader,
  plugins,
  runWebpack
} from "./helpers";

describe("imagemin plugin", () => {
  it("should optimizes all images (loader + plugin)", () =>
    Promise.resolve()
      .then(() => runWebpack({ emitPlugin: true, imageminPlugin: true }))
      .then(stats => {
        const { warnings, errors, assets, modules } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.jpg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.svg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "plugin-test.jpg")).toBe(
          false
        );

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

  it("should optimizes all images (loader + plugin) as minimizer", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          asMinimizer: true,
          emitPlugin: true,
          imageminPlugin: true
        })
      )
      .then(stats => {
        const { warnings, errors, assets, modules } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.jpg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.svg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "plugin-test.jpg")).toBe(
          false
        );

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

  it("should optimizes all images (loader + plugin) (multi compiler mode)", () =>
    Promise.resolve()
      .then(() => runWebpack({ emitPlugin: true, imageminPlugin: true }, true))
      .then(multiStats => {
        expect(multiStats.stats).toHaveLength(2);

        return multiStats;
      })
      .then(multiStats => {
        const {
          warnings,
          errors,
          assets,
          modules
        } = multiStats.stats[0].compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.jpg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.svg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "plugin-test.jpg")).toBe(
          false
        );

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg",
            "plugin-test.jpg"
          ],
          assets
        ).then(() => multiStats);
      })
      .then(multiStats => {
        const {
          warnings,
          errors,
          assets,
          modules
        } = multiStats.stats[1].compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.jpg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.svg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "plugin-test.jpg")).toBe(
          false
        );

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

  it("should optimizes all images and cache their (loader + plugin)", () => {
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

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
            expect(Object.keys(cachedAssets)).toHaveLength(4);

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

            expect(warnings).toHaveLength(0);
            expect(errors).toHaveLength(0);
            expect(Object.keys(assets)).toHaveLength(6);

            return true;
          })
          .then(() => del(cacheDir))
      );
  });

  it("should optimizes all images and cache their (custom cache location) (loader + plugin)", () => {
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

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
            expect(Object.keys(cachedAssets)).toHaveLength(4);

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

            expect(warnings).toHaveLength(0);
            expect(errors).toHaveLength(0);
            expect(Object.keys(assets)).toHaveLength(6);

            return true;
          })
          .then(() => del(cacheDir))
      );
  });

  it("should optimizes all images and doesn't cache their (loader + plugin)", () => {
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

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
            expect(Object.keys(cachedAssets)).toHaveLength(0);

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

            expect(warnings).toHaveLength(0);
            expect(errors).toHaveLength(0);
            expect(Object.keys(assets)).toHaveLength(6);

            return true;
          })
          .then(() => del(cacheDir))
      );
  });

  it("should optimizes all images (plugin standalone)", () =>
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

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

  it("should optimizes successfully without any assets", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          entry: path.join(fixturesPath, "empty-entry.js"),
          imageminPlugin: true
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(1);

        return stats;
      }));

  it("should throws errors if imagemin plugins don't setup (by plugin)", () =>
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(Object.keys(assets)).toHaveLength(2);

        errors.forEach(error => {
          expect(error.message).toMatch(/No\splugins\sfound\sfor\s`imagemin`/);
        });

        return stats;
      }));

  it("should throws errors if imagemin plugins don't setup (by loader)", () =>
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(Object.keys(assets)).toHaveLength(2);

        stats.compilation.errors.forEach(error => {
          expect(error.message).toMatch(/No\splugins\sfound\sfor\s`imagemin`/);
        });

        return stats;
      }));

  it("should optimizes images and throws error on corrupted images using `plugin.bail` option with `true` value (by plugin)", () =>
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(Object.keys(assets)).toHaveLength(3);
        expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);

        return isCompressed(["plugin-test.png"], assets);
      }));

  it("should optimizes images and throws errors on corrupted images using `plugin.bail` option with `true` value (by loader)", () =>
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(Object.keys(assets)).toHaveLength(3);

        return isCompressed(["loader-test.png"], assets);
      }));

  it("should optimizes images and throws warning on corrupted images using `plugin.bail` option with `false` value (by plugin)", () =>
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

        expect(warnings).toHaveLength(1);
        expect(errors).toHaveLength(0);
        expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(Object.keys(assets)).toHaveLength(3);

        return isCompressed(["plugin-test.png"], assets);
      }));

  it("should optimizes images and throws errors on corrupted images using `plugin.bail` option with `false` value (by loader)", () =>
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

        expect(warnings).toHaveLength(1);
        expect(errors).toHaveLength(0);
        expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(Object.keys(assets)).toHaveLength(3);

        return isCompressed(["loader-test.png"], assets);
      }));

  it("should optimizes images and throws errors on corrupted images using `webpack.bail` option with `true` value (by plugin)", () =>
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(Object.keys(assets)).toHaveLength(3);

        return isCompressed(["plugin-test.png"], assets);
      }));

  it("should optimizes images and throws warning on corrupted images using `webpack.bail` option with `true` value (by loader)", () =>
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(Object.keys(assets)).toHaveLength(3);

        return isCompressed(["loader-test.png"], assets);
      }));

  it("should optimizes images and throw warnings on corrupted images using `webpack.bail` option with `false` value (by plugin)", () =>
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

        expect(warnings).toHaveLength(1);
        expect(errors).toHaveLength(0);
        expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(Object.keys(assets)).toHaveLength(3);

        return isCompressed(["plugin-test.png"], assets);
      }));

  it("should optimizes images and throw warnings on corrupted images using `webpack.bail` option with `false` value (by loader)", () =>
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

        expect(warnings).toHaveLength(1);
        expect(errors).toHaveLength(0);
        expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);
        expect(Object.keys(assets)).toHaveLength(3);

        return isCompressed(["loader-test.png"], assets);
      }));

  it("should optimizes images and contains not empty manifest", () => {
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

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(3);
        expect(manifest).toEqual({
          "plugin-test.jpg": "dddd284f1bd12a27330d4d186a044d47.jpg"
        });

        return stats;
      });
  });

  it("should optimizes images and interpolate assets names exclude module assets", () => {
    const manifest = {};

    return Promise.resolve()
      .then(() =>
        runWebpack({
          emitPlugin: true,
          entry: path.join(fixturesPath, "loader.js"),
          imageminPluginOptions: {
            imageminOptions: {
              plugins
            },
            loader: false,
            manifest
          }
        })
      )
      .then(stats => {
        const { assets, warnings, errors } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);
        expect(
          Object.keys(assets).every(
            element =>
              [
                "loader-test.gif",
                "loader-test.jpg",
                "loader-test.png",
                "loader-test.svg",
                "bundle.js",
                "dddd284f1bd12a27330d4d186a044d47.jpg"
              ].indexOf(element) >= 0
          )
        ).toBe(true);
        expect(manifest).toEqual({
          "plugin-test.jpg": "dddd284f1bd12a27330d4d186a044d47.jpg"
        });

        return stats;
      });
  });

  it("should optimizes all images (loader + plugin) and interpolate `[name].[ext]` name", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          emitPluginOptions: {
            fileNames: ["plugin-test.png"]
          },
          imageminPluginOptions: {
            imageminOptions: { plugins },
            name: "[name].[ext]"
          },
          name: "[name].[ext]"
        })
      )
      .then(stats => {
        const { warnings, errors, assets, modules } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toMatchSnapshot();

        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.jpg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.svg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "plugin-test.jpg")).toBe(
          false
        );

        return stats;
      }));

  it("should optimizes all images (loader + plugin) and interpolate `[path][name].[ext]` name", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          entry: path.join(fixturesPath, "./nested/deep/loader.js"),
          emitPluginOptions: {
            fileNames: ["nested/deep/plugin-test.png"]
          },
          imageminPluginOptions: {
            imageminOptions: { plugins },
            name: "[path][name].[ext]"
          },
          name: "[path][name].[ext]"
        })
      )
      .then(stats => {
        const { warnings, errors, assets, modules } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toMatchSnapshot();

        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.jpg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.svg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "plugin-test.jpg")).toBe(
          false
        );

        return stats;
      }));

  it("should optimizes all images (loader + plugin) exclude filtered", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          emitPlugin: true,
          imageminPluginOptions: {
            filter: (source, sourcePath) => {
              expect(source).toBeInstanceOf(Buffer);
              expect(typeof sourcePath).toBe("string");

              if (source.byteLength === 631) {
                return false;
              }

              return true;
            },
            imageminOptions: {
              plugins
            },
            name: "[path][name].[ext]"
          }
        })
      )
      .then(stats => {
        const { warnings, errors, assets, modules } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(6);

        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.jpg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.gif")).toBe(true);
        expect(modulesHasImageminLoader(modules, "loader-test.svg")).toBe(true);
        expect(modulesHasImageminLoader(modules, "plugin-test.jpg")).toBe(
          false
        );

        // Need add check `!isCompressed on `loader-test.jpg` and `plugin-test.jpg`

        return isCompressed(
          ["loader-test.gif", "loader-test.png", "loader-test.svg"],
          assets
        );
      }));
});
