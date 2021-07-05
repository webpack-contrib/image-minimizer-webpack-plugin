import path from "path";

import {
  fixturesPath,
  isOptimized,
  hasLoader,
  plugins,
  webpack,
} from "./helpers";

describe("plugin filter option", () => {
  it("should optimizes all images (loader + plugin) exclude filtered", async () => {
    const stats = await webpack({
      emitPlugin: true,
      imageminPluginOptions: {
        minimizerOptions: {
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
          plugins,
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.jpg", modules)).toBe(true);
    expect(hasLoader("loader-test.gif", modules)).toBe(true);
    expect(hasLoader("loader-test.svg", modules)).toBe(true);

    await expect(isOptimized("loader-test.gif", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.jpg", compilation)).resolves.toBe(
      false
    );
    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("loader-test.svg", compilation)).resolves.toBe(
      true
    );
    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      false
    );
  });

  it("should optimizes all images with filter (multiple plugins)", async () => {
    let firstFilterCounter = 0;
    let secondFilterCounter = 0;

    const stats = await webpack({
      entry: path.join(fixturesPath, "multiple-entry.js"),
      emitPluginOptions: {
        fileNames: ["multiple-plugin-test-1.svg", "multiple-plugin-test-2.svg"],
      },
      imageminPluginOptions: [
        {
          minimizerOptions: {
            filter: (source) => {
              if (source.byteLength > 500) {
                firstFilterCounter += 1;

                return true;
              }

              return false;
            },
            plugins,
          },
        },
        {
          minimizerOptions: {
            filter: (source) => {
              if (source.byteLength < 500) {
                secondFilterCounter += 1;

                return true;
              }

              return false;
            },
            plugins,
          },
        },
      ],
    });
    const { compilation } = stats;
    const { warnings, errors, modules } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(firstFilterCounter).toBe(2);
    expect(secondFilterCounter).toBe(2);

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-1.svg", compilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-2.svg", compilation)
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
            "multiple-plugin-test-2.svg",
          ],
        },
        imageminPluginOptions: {
          minimizerOptions: {
            filter: (source) => {
              if (source.byteLength > 500) {
                firstFilterCounter += 1;

                return true;
              }

              return false;
            },
            plugins,
          },
        },
      },
      {
        entry: path.join(fixturesPath, "multiple-entry-2.js"),
        emitPluginOptions: {
          fileNames: [
            "multiple-plugin-test-3.svg",
            "multiple-plugin-test-4.svg",
          ],
        },
        imageminPluginOptions: {
          minimizerOptions: {
            filter: (source) => {
              if (source.byteLength < 500) {
                secondFilterCounter += 1;

                return true;
              }

              return false;
            },
            plugins,
          },
        },
      },
    ]);
    const [{ compilation: firstCompilation }] = multiStats.stats;
    const { warnings, errors, modules } = firstCompilation;

    expect(multiStats.stats).toHaveLength(2);

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(firstFilterCounter).toBe(2);

    expect(hasLoader("multiple-loader-test-1.svg", modules)).toBe(true);
    expect(hasLoader("multiple-loader-test-2.svg", modules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-1.svg", firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-loader-test-2.svg", firstCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized("multiple-plugin-test-1.svg", firstCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-2.svg", firstCompilation)
    ).resolves.toBe(false);

    const [, { compilation: secondCompilation }] = multiStats.stats;
    const {
      warnings: secondWarnings,
      errors: secondErrors,
      modules: secondModules,
    } = secondCompilation;

    expect(secondWarnings).toHaveLength(0);
    expect(secondErrors).toHaveLength(0);

    expect(secondFilterCounter).toBe(2);

    expect(hasLoader("multiple-loader-test-3.svg", secondModules)).toBe(true);
    expect(hasLoader("multiple-loader-test-4.svg", secondModules)).toBe(true);

    await expect(
      isOptimized("multiple-loader-test-3.svg", secondCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized("multiple-loader-test-4.svg", secondCompilation)
    ).resolves.toBe(true);
    await expect(
      isOptimized("multiple-plugin-test-3.svg", secondCompilation)
    ).resolves.toBe(false);
    await expect(
      isOptimized("multiple-plugin-test-4.svg", secondCompilation)
    ).resolves.toBe(true);
  });
});
