import path from "path";
import cacache from "cacache";
import del from "del";
import findCacheDir from "find-cache-dir";
import {
  fixturesPath,
  isOptimized,
  hasLoader,
  plugins,
  webpack
} from "./helpers";

describe("imagemin plugin", () => {
  it("should optimizes all images (loader + plugin)", async () => {
    const stats = await webpack({ emitPlugin: true, imageminPlugin: true });
    const { warnings, errors, assets, modules } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(true);
  });

  it("should optimizes all images (loader + plugin) as minimizer", async () => {
    const stats = await webpack({
      asMinimizer: true,
      emitPlugin: true,
      imageminPlugin: true
    });
    const { warnings, errors, assets, modules } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(true);
  });

  it("should optimizes all images (loader + plugin) (multi compiler mode)", async () => {
    const multiStats = await webpack([
      {
        entry: path.join(fixturesPath, "multiple-entry.js"),
        emitPluginOptions: {
          fileNames: ["multiple-plugin-test-1.svg"]
        },
        imageminPlugin: true
      },
      {
        entry: path.join(fixturesPath, "multiple-entry-2.js"),
        emitPluginOptions: {
          fileNames: ["multiple-plugin-test-2.svg"]
        },
        imageminPlugin: true
      }
    ]);

    expect(multiStats.stats).toHaveLength(2);

    const {
      warnings,
      errors,
      assets,
      modules
    } = multiStats.stats[0].compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-1.svg", assets)
    ).resolves.toBe(true);

    const {
      warnings: secondWarnings,
      errors: secondErrors,
      assets: secondAssets,
      modules: secondModules
    } = multiStats.stats[1].compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(hasLoader("multiple-loader-test-3.svg", secondModules)).toBe(true);
    expect(hasLoader("multiple-loader-test-4.svg", secondModules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-3.svg", secondAssets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-4.svg", secondAssets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-2.svg", secondAssets)
    ).resolves.toBe(true);
  });

  it("should optimizes all images and cache their (loader + plugin)", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const cacheDir = findCacheDir({ name: "imagemin-webpack" });

    await del(cacheDir);

    const options = {
      emitPlugin: true,
      imageminPluginOptions: {
        cache: true,
        imageminOptions: { plugins },
        name: "[path][name].[ext]"
      }
    };
    const stats = await webpack(options);
    const { warnings, errors, assets } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(5);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(5);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondStats = await webpack(options);
    const {
      warnings: secondWarnings,
      errors: secondErrors,
      assets: secondAssets
    } = secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", secondAssets)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", secondAssets)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", secondAssets)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", secondAssets)).resolves.toBe(
      true
    );

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(5);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await del(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimizes all images and cache their (custom cache location) (loader + plugin)", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const cacheDir = findCacheDir({
      name: "imagemin-webpack-plugin-cache-location"
    });

    await del(cacheDir);

    const options = {
      emitPlugin: true,
      imageminPluginOptions: {
        cache: cacheDir,
        imageminOptions: { plugins },
        name: "[path][name].[ext]"
      }
    };
    const stats = await webpack(options);
    const { warnings, errors, assets } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(true);

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(5);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(5);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondStats = await webpack(options);
    const {
      warnings: secondWarnings,
      errors: secondErrors,
      assets: secondAssets
    } = secondStats.compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", secondAssets)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", secondAssets)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", secondAssets)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", secondAssets)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.jpg", secondAssets)).resolves.toBe(
      true
    );

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(5);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await del(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimizes all images and doesn't cache their (loader + plugin)", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const stats = await webpack({
      emitPlugin: true,
      imageminPluginOptions: {
        cache: false,
        imageminOptions: { plugins },
        name: "[path][name].[ext]"
      }
    });

    const { warnings, errors, assets } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(true);

    expect(spyGet).toHaveBeenCalledTimes(0);
    expect(spyPut).toHaveBeenCalledTimes(0);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimizes all images (plugin standalone)", async () => {
    const stats = await webpack({
      emitPlugin: true,
      imageminPluginOptions: {
        imageminOptions: { plugins },
        loader: false,
        name: "[path][name].[ext]"
      }
    });
    const { warnings, errors, assets } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(true);
  });

  it("should optimizes successfully without any assets", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPlugin: true
    });

    const { warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("should throws errors if imagemin plugins don't setup (by plugin)", async () => {
    const stats = await webpack({
      emitPlugin: true,
      entry: path.join(fixturesPath, "empty-entry.js"),
      imageminPluginOptions: {
        name: "[name].[ext]",
        imageminOptions: {
          plugins: []
        }
      }
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].toString()).toMatch(/No\splugins\sfound\sfor\s`imagemin`/);

    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(false);
  });

  it("should throws errors if imagemin plugins don't setup (by loader)", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "single-image-loader.js"),
      imageminPluginOptions: {
        imageminOptions: {
          plugins: []
        }
      }
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);

    expect(errors[0].toString()).toMatch(/No\splugins\sfound\sfor\s`imagemin`/);

    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(false);
  });

  it("should optimizes images and throws error on corrupted images using `plugin.bail` option with `true` value (by plugin)", async () => {
    const stats = await webpack({
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
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("plugin-test.png", assets)).resolves.toBe(true);
  });

  it(
    "should optimi" +
      "zes images and throws errors on corrupted images using `plugin.bail` option with `true` value (by loader)",
    async () => {
      const stats = await webpack({
        entry: path.join(fixturesPath, "loader-corrupted.js"),
        imageminPluginOptions: {
          bail: true,
          imageminOptions: {
            plugins
          },
          name: "[path][name].[ext]"
        }
      });
      const { assets, warnings, errors } = stats.compilation;

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);

      await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    }
  );

  it("should optimizes images and throws warning on corrupted images using `plugin.bail` option with `false` value (by plugin)", async () => {
    const stats = await webpack({
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
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("plugin-test.png", assets)).resolves.toBe(true);
  });

  it("should optimizes images and throws errors on corrupted images using `plugin.bail` option with `false` value (by loader)", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminPluginOptions: {
        bail: false,
        imageminOptions: {
          plugins
        },
        name: "[path][name].[ext]"
      }
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
  });

  it("should optimizes images and throws errors on corrupted images using `webpack.bail` option with `true` value (by plugin)", async () => {
    const stats = await webpack({
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
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("plugin-test.png", assets)).resolves.toBe(true);
  });

  it("should optimizes images and throws warning on corrupted images using `webpack.bail` option with `true` value (by loader)", async () => {
    const stats = await webpack({
      bail: true,
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminPluginOptions: {
        imageminOptions: {
          plugins
        },
        name: "[path][name].[ext]"
      }
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
  });

  it("should optimizes images and throw warnings on corrupted images using `webpack.bail` option with `false` value (by plugin)", async () => {
    const stats = await webpack({
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
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("plugin-test.png", assets)).resolves.toBe(true);
  });

  it("should optimizes images and throw warnings on corrupted images using `webpack.bail` option with `false` value (by loader)", async () => {
    const stats = await webpack({
      bail: false,
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminPluginOptions: {
        imageminOptions: {
          plugins
        }
      }
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
  });

  it("should optimizes images and contains not empty manifest", async () => {
    const manifest = {};
    const stats = await webpack({
      emitPlugin: true,
      entry: path.join(fixturesPath, "single-image-loader.js"),
      imageminPluginOptions: {
        imageminOptions: {
          plugins
        },
        manifest
      }
    });
    const { warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(manifest).toEqual({
      "plugin-test.jpg": "463cb29d806bd713487cfbcc6fccc982.jpg"
    });
  });

  it("should optimizes images and interpolate assets names exclude module assets", async () => {
    const manifest = {};
    const stats = await webpack({
      emitPlugin: true,
      entry: path.join(fixturesPath, "loader.js"),
      imageminPluginOptions: {
        imageminOptions: {
          plugins
        },
        loader: false,
        manifest
      }
    });
    const { assets, warnings, errors } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(
      Object.keys(assets).every(
        element =>
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg",
            "bundle.js",
            "463cb29d806bd713487cfbcc6fccc982.jpg"
          ].indexOf(element) >= 0
      )
    ).toBe(true);
    expect(manifest).toEqual({
      "plugin-test.jpg": "463cb29d806bd713487cfbcc6fccc982.jpg"
    });
  });

  it("should optimizes all images (loader + plugin) and interpolate `[name].[ext]` name", async () => {
    const stats = await webpack({
      emitPluginOptions: {
        fileNames: ["plugin-test.png"]
      },
      imageminPluginOptions: {
        imageminOptions: { plugins },
        name: "[name].[ext]"
      },
      name: "[name].[ext]"
    });
    const { warnings, errors, assets, modules } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.png", assets)).resolves.toBe(true);
  });

  it("should optimizes all images (loader + plugin) and interpolate `[path][name].[ext]` name", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "./nested/deep/loader.js"),
      emitPluginOptions: {
        fileNames: ["nested/deep/plugin-test.png"]
      },
      imageminPluginOptions: {
        imageminOptions: { plugins },
        name: "[path][name].[ext]"
      },
      name: "[path][name].[ext]"
    });
    const { warnings, errors, assets, modules } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(
      isOptimized("nested/deep/loader-test.gif", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/loader-test.jpg", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/loader-test.png", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/loader-test.svg", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("nested/deep/plugin-test.png", assets)
    ).resolves.toBe(true);
  });

  it("should optimizes all images (loader + plugin) exclude filtered", async () => {
    const stats = await webpack({
      emitPlugin: true,
      imageminPluginOptions: {
        filter: (source, sourcePath) => {
          expect(source).toBeInstanceOf(Buffer);
          expect(typeof sourcePath).toBe("string");

          if (
            sourcePath.endsWith("loader-test.jpg") ||
            sourcePath.endsWith("plugin-test.jpg")
          ) {
            return false;
          }

          return true;
        },
        imageminOptions: {
          plugins
        },
        name: "[path][name].[ext]"
      }
    });
    const { warnings, errors, assets, modules } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.jpg", assets)).resolves.toBe(false);
    await expect(isOptimized("loader-test.png", assets)).resolves.toBe(true);
    await expect(isOptimized("loader-test.svg", assets)).resolves.toBe(true);
    await expect(isOptimized("plugin-test.jpg", assets)).resolves.toBe(false);
  });

  it("should optimizes all images with filter (multiple plugins)", async () => {
    let firstFilterCounter = 0;
    let secondFilterCounter = 0;

    const stats = await webpack({
      entry: path.join(fixturesPath, "multiple-entry.js"),
      emitPluginOptions: {
        fileNames: ["multiple-plugin-test-1.svg", "multiple-plugin-test-2.svg"]
      },
      imageminPluginOptions: [
        {
          filter: source => {
            if (source.byteLength > 500) {
              firstFilterCounter++;

              return true;
            }

            return false;
          },
          imageminOptions: {
            plugins
          },
          name: "[name].1.[ext]"
        },
        {
          filter: source => {
            if (source.byteLength < 500) {
              secondFilterCounter++;

              return true;
            }

            return false;
          },
          imageminOptions: {
            plugins
          },
          name: "[name].2.[ext]"
        }
      ]
    });
    const { warnings, errors, assets, modules } = stats.compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(firstFilterCounter).toBe(2);
    expect(secondFilterCounter).toBe(2);

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized(
        ["multiple-plugin-test-1.1.svg", "multiple-plugin-test-1.svg"],
        assets
      )
    ).resolves.toBe(true);
    await expect(
      isOptimized(
        ["multiple-plugin-test-2.2.svg", "multiple-plugin-test-2.svg"],
        assets
      )
    ).resolves.toBe(true);
  });

  it("should optimizes all images with filter (multi compiler mode)", async () => {
    let firstFilterCounter = 0;
    let secondFilterCounter = 0;

    const multiStats = await webpack([
      {
        entry: path.join(fixturesPath, "multiple-entry.js"),
        emitPluginOptions: {
          fileNames: [
            "multiple-plugin-test-1.svg",
            "multiple-plugin-test-2.svg"
          ]
        },
        imageminPluginOptions: {
          filter: source => {
            if (source.byteLength > 500) {
              firstFilterCounter++;

              return true;
            }

            return false;
          },
          imageminOptions: {
            plugins
          },
          name: "[name].1.[ext]"
        }
      },
      {
        entry: path.join(fixturesPath, "multiple-entry-2.js"),
        emitPluginOptions: {
          fileNames: [
            "multiple-plugin-test-3.svg",
            "multiple-plugin-test-4.svg"
          ]
        },
        imageminPluginOptions: {
          filter: source => {
            if (source.byteLength < 500) {
              secondFilterCounter++;

              return true;
            }

            return false;
          },
          imageminOptions: {
            plugins
          },
          name: "[name].2.[ext]"
        }
      }
    ]);
    const {
      warnings,
      errors,
      assets,
      modules
    } = multiStats.stats[0].compilation;

    expect(multiStats.stats).toHaveLength(2);

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(firstFilterCounter).toBe(2);

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", assets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", assets)
    ).resolves.toBe(false);
    await expect(
      isOptimized(
        ["multiple-plugin-test-1.1.svg", "multiple-plugin-test-1.svg"],
        assets
      )
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-2.svg", assets)
    ).resolves.toBe(false);

    const {
      warnings: secondWarnings,
      errors: secondErrors,
      assets: secondAssets,
      modules: secondModules
    } = multiStats.stats[1].compilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondFilterCounter).toBe(2);

    expect(hasLoader("multiple-loader-test-3.svg", secondModules)).toBe(true);
    expect(hasLoader("multiple-loader-test-4.svg", secondModules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-3.svg", secondAssets)
    ).resolves.toBe(false);
    await expect(
      isOptimized("multiple-loader-test-4.svg", secondAssets)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-3.svg", secondAssets)
    ).resolves.toBe(false);
    await expect(
      isOptimized(
        ["multiple-plugin-test-4.2.svg", "multiple-plugin-test-4.svg"],
        secondAssets
      )
    ).resolves.toBe(true);
  });
});
