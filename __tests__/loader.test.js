import path from "path";
import cacache from "cacache";
import del from "del";
import findCacheDir from "find-cache-dir";
import { fixturesPath, isCompressed, plugins, runWebpack } from "./helpers";

describe("loader", () => {
  it("should optimizes all images", () =>
    Promise.resolve()
      .then(() => runWebpack({ imageminLoader: true }))
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(5);

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg"
          ],
          assets
        );
      }));

  it("should optimizes all images and don't break non images", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          entry: path.join(fixturesPath, "loader-other-imports.js"),
          imageminLoader: true,
          test: /\.(jpe?g|png|gif|svg|css|txt)$/i
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(7);
        expect(
          assets["loader-test.txt"]
            .source()
            .toString()
            .replace(/\r\n|\r/g, "\n")
        ).toBe("TEXT\n");
        expect(
          assets["loader-test.css"]
            .source()
            .toString()
            .replace(/\r\n|\r/g, "\n")
        ).toBe("a {\n  color: red;\n}\n");

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg"
          ],
          assets
        );
      }));

  it("should optimizes all images and cache their", () => {
    const cacheDir = findCacheDir({ name: "imagemin-webpack" });

    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        runWebpack({
          imageminLoaderOptions: { cache: true, imageminOptions: { plugins } }
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(5);

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg"
          ],
          assets
        );
      })
      .then(() =>
        cacache
          .ls(cacheDir)
          .then(cachedAssets => {
            expect(Object.keys(cachedAssets)).toHaveLength(4);

            return true;
          })
          .then(() => runWebpack({ cache: true }))
          .then(stats => {
            const { warnings, errors, assets } = stats.compilation;

            expect(warnings).toHaveLength(0);
            expect(errors).toHaveLength(0);
            expect(Object.keys(assets)).toHaveLength(5);

            return true;
          })
          .then(() => del(cacheDir))
      );
  });

  it("should optimizes all images and cache their (custom cache location)", () => {
    const cacheDir = findCacheDir({ name: "imagemin-loader-cache-location" });

    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        runWebpack({
          imageminLoaderOptions: {
            cache: cacheDir,
            imageminOptions: { plugins }
          }
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(5);

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg"
          ],
          assets
        );
      })
      .then(() =>
        cacache
          .ls(cacheDir)
          .then(cachedAssets => {
            expect(Object.keys(cachedAssets)).toHaveLength(4);

            return true;
          })
          .then(() => runWebpack({ cache: cacheDir }))
          .then(stats => {
            const { warnings, errors, assets } = stats.compilation;

            expect(warnings).toHaveLength(0);
            expect(errors).toHaveLength(0);
            expect(Object.keys(assets)).toHaveLength(5);

            return true;
          })
          .then(() => del(cacheDir))
      );
  });

  it("should optimizes all images and doesn't cache their", () => {
    const cacheDir = findCacheDir({ name: "imagemin-webpack" });

    return Promise.resolve()
      .then(() => del(cacheDir))
      .then(() =>
        runWebpack({
          imageminLoaderOptions: { cache: false, imageminOptions: { plugins } }
        })
      )
      .then(stats => {
        const { warnings, errors, assets } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        expect(Object.keys(assets)).toHaveLength(5);

        return isCompressed(
          [
            "loader-test.gif",
            "loader-test.jpg",
            "loader-test.png",
            "loader-test.svg"
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
          .then(() => runWebpack({ cache: false }))
          .then(stats => {
            const { warnings, errors, assets } = stats.compilation;

            expect(warnings).toHaveLength(0);
            expect(errors).toHaveLength(0);
            expect(Object.keys(assets)).toHaveLength(5);

            return true;
          })
          .then(() => del(cacheDir))
      );
  });

  it("should throws error if imagemin plugins don't setup", () =>
    Promise.resolve()
      .then(() => runWebpack({ imageminLoaderOptions: {} }))
      .then(stats => {
        const { warnings, errors } = stats.compilation;

        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(4);

        stats.compilation.errors.forEach(error => {
          expect(error.message).toMatch(/No\splugins\sfound\sfor\s`imagemin`/);
        });

        return stats;
      }));

  it("should throws error on corrupted images using `bail` option with `true` value", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          entry: path.join(fixturesPath, "loader-corrupted.js"),
          imageminLoaderOptions: { bail: true, imageminOptions: { plugins } }
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

  it("should throws warning on corrupted images using `bail` option with `false` value", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          entry: path.join(fixturesPath, "loader-corrupted.js"),
          imageminLoaderOptions: { bail: false, imageminOptions: { plugins } }
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

  it("should throws error on corrupted images using `webpack.bail` option with `true` value", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          bail: true,
          entry: path.join(fixturesPath, "loader-corrupted.js"),
          imageminLoaderOptions: { imageminOptions: { plugins } }
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

  it("should throws warning on corrupted images using `webpack.bail` option with `false` value", () =>
    Promise.resolve()
      .then(() =>
        runWebpack({
          bail: false,
          entry: path.join(fixturesPath, "loader-corrupted.js"),
          imageminLoaderOptions: { imageminOptions: { plugins } }
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
});
