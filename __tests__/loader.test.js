import { fixturesPath, isCompressed, plugins, runWebpack } from "./helpers";
import cacache from "cacache";
import del from "del";
import findCacheDir from "find-cache-dir";
import path from "path";
import test from "ava";

test("should optimizes all images", t =>
  Promise.resolve()
    .then(() => runWebpack({ imageminLoader: true }))
    .then(stats => {
      const { warnings, errors, assets } = stats.compilation;

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 5, "5 assets");

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

test("should optimizes all images and don't break non images", t =>
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

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 7, "7 assets");
      t.true(
        assets["loader-test.txt"].source().toString() === "TEXT\n",
        "txt file doesn't broken"
      );
      t.true(
        assets["loader-test.css"].source().toString() ===
          "a {\n  color: red;\n}\n",
        "css file doesn't broken"
      );

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

test.serial("should optimizes all images and cache their", t => {
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

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 5, "5 assets");

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
          t.true(Object.keys(cachedAssets).length === 4, "4 cached assets");

          return true;
        })
        .then(() => runWebpack({ cache: true }))
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

test.serial(
  "should optimizes all images and cache their (custom cache location)",
  t => {
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

        t.true(warnings.length === 0, "no compilation warnings");
        t.true(errors.length === 0, "no compilation error");
        t.true(Object.keys(assets).length === 5, "5 assets");

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
            t.true(Object.keys(cachedAssets).length === 4, "4 cached assets");

            return true;
          })
          .then(() => runWebpack({ cache: cacheDir }))
          .then(stats => {
            const { warnings, errors, assets } = stats.compilation;

            t.true(warnings.length === 0, "no compilation warnings");
            t.true(errors.length === 0, "no compilation error");
            t.true(Object.keys(assets).length === 5, "5 assets");

            return true;
          })
          .then(() => del(cacheDir))
      );
  }
);

test.serial("should optimizes all images and doesn't cache their", t => {
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

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 5, "5 assets");

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
          t.true(Object.keys(cachedAssets).length === 0, "0 cached assets");

          return true;
        })
        .then(() => runWebpack({ cache: false }))
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

test("should throws error if imagemin plugins don't setup", t =>
  Promise.resolve()
    .then(() => runWebpack({ imageminLoaderOptions: {} }))
    .then(stats => {
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
    }));

test("should throws error on corrupted images using `bail` option with `true` value", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        entry: path.join(fixturesPath, "loader-corrupted.js"),
        imageminLoaderOptions: { bail: true, imageminOptions: { plugins } }
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

test("should throws warning on corrupted images using `bail` option with `false` value", t =>
  Promise.resolve()
    .then(() =>
      runWebpack({
        entry: path.join(fixturesPath, "loader-corrupted.js"),
        imageminLoaderOptions: { bail: false, imageminOptions: { plugins } }
      })
    )
    .then(stats => {
      const { assets, warnings, errors } = stats.compilation;

      t.true(warnings.length === 1, "no compilation warnings");
      t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["loader-test.png"], assets);
    }));

test("should throws error on corrupted images using `webpack.bail` option with `true` value", t =>
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

      t.true(warnings.length === 0, "no compilation warnings");
      t.true(errors.length === 1, "no compilation error");
      t.regex(errors[0].message, /Corrupt\sJPEG\sdata/);
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["loader-test.png"], assets);
    }));

test("should throws warning on corrupted images using `webpack.bail` option with `false` value", t =>
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

      t.true(warnings.length === 1, "no compilation warnings");
      t.regex(warnings[0].message, /Corrupt\sJPEG\sdata/);
      t.true(errors.length === 0, "no compilation error");
      t.true(Object.keys(assets).length === 3, "3 assets");

      return isCompressed(["loader-test.png"], assets);
    }));
