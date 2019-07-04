import os from "os";
import fs from "fs";
import path from "path";
import cacache from "cacache";
import findCacheDir from "find-cache-dir";
import pify from "pify";
import { fixturesPath, isOptimized, plugins, webpack } from "./helpers";

describe("loader", () => {
  it("should optimizes all images", async () => {
    const stats = await webpack({ imageminLoader: true });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes all images and don't break non images", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-other-imports.js"),
      imageminLoader: true,
      test: /\.(jpe?g|png|gif|svg|css|txt)$/i
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(7);

    const { path: outputPath } = compilation.options.output;

    const txtBuffer = await pify(fs.readFile)(
      path.join(outputPath, "loader-test.txt")
    );

    expect(txtBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe("TEXT\n");

    const cssBuffer = await pify(fs.readFile)(
      path.join(outputPath, "loader-test.css")
    );

    expect(cssBuffer.toString().replace(/\r\n|\r/g, "\n")).toBe(
      "a {\n  color: red;\n}\n"
    );

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes all images and cache their", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const cacheDir = findCacheDir({ name: "imagemin-webpack" }) || os.tmpdir();

    await cacache.rm.all(cacheDir);

    const options = {
      imageminLoaderOptions: { cache: true, imageminOptions: { plugins } }
    };
    const stats = await webpack(options);
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(4);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(4);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondStats = await webpack(options);
    const { compilation: secondCompilation } = secondStats;
    const {
      warnings: secondWarnings,
      errors: secondErrors
    } = secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    await expect(
      isOptimized("loader-test.gif", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("loader-test.jpg", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("loader-test.png", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("loader-test.svg", secondCompilation)
    ).resolves.toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(4);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimizes all images and cache their (custom cache location)", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const cacheDir =
      findCacheDir({
        name: "imagemin-webpack-loader-custom-cache-location-for-loader"
      }) || os.tmpdir();

    await cacache.rm.all(cacheDir);

    const options = {
      imageminLoaderOptions: { cache: cacheDir, imageminOptions: { plugins } }
    };
    const stats = await webpack(options);
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );

    // Try to found cached files, but we don't have their in cache
    expect(spyGet).toHaveBeenCalledTimes(4);
    // Put files in cache
    expect(spyPut).toHaveBeenCalledTimes(4);

    spyGet.mockClear();
    spyPut.mockClear();

    const secondStats = await webpack(options);
    const { compilation: secondCompilation } = secondStats;
    const {
      warnings: secondWarnings,
      errors: secondErrors
    } = secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    await expect(
      isOptimized("loader-test.gif", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("loader-test.jpg", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("loader-test.png", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("loader-test.svg", secondCompilation)
    ).resolves.toBe(true);

    // Now we have cached files so we get their and don't put
    expect(spyGet).toHaveBeenCalledTimes(4);
    expect(spyPut).toHaveBeenCalledTimes(0);

    await cacache.rm.all(cacheDir);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should optimizes all images and doesn't cache their", async () => {
    const spyGet = jest.spyOn(cacache, "get");
    const spyPut = jest.spyOn(cacache, "put");

    const stats = await webpack({
      imageminLoaderOptions: { cache: false, imageminOptions: { plugins } }
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );

    expect(spyGet).toHaveBeenCalledTimes(0);
    expect(spyPut).toHaveBeenCalledTimes(0);

    spyGet.mockRestore();
    spyPut.mockRestore();
  });

  it("should throws error if imagemin plugins don't setup", async () => {
    const stats = await webpack({ imageminLoaderOptions: {} });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(4);

    stats.compilation.errors.forEach(error => {
      expect(error.message).toMatch(/No\splugins\sfound\sfor\s`imagemin`/);
    });
  });

  it("should throws error on corrupted images using `bail` option with `true` value", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: { bail: true, imageminOptions: { plugins } }
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws warning on corrupted images using `bail` option with `false` value", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: { bail: false, imageminOptions: { plugins } }
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using `webpack.bail` option with `true` value", async () => {
    const stats = await webpack({
      bail: true,
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: { imageminOptions: { plugins } }
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws warning on corrupted images using `webpack.bail` option with `false` value", async () => {
    const stats = await webpack({
      bail: false,
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: { imageminOptions: { plugins } }
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(/Corrupt\sJPEG\sdata/);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should optimizes all images exclude filtered", async () => {
    const stats = await webpack({
      imageminLoaderOptions: {
        filter: (source, sourcePath) => {
          expect(source).toBeInstanceOf(Buffer);
          expect(typeof sourcePath).toBe("string");

          if (source.byteLength === 631) {
            return false;
          }

          return true;
        },
        imageminOptions: { plugins }
      }
    });

    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(Object.keys(assets)).toHaveLength(5);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      false
    );
  });
});
