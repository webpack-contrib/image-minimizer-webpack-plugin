import path from "path";

import { fixturesPath, isOptimized, plugins, webpack } from "./helpers";

describe("loader severityError option", () => {
  it("should throws error on corrupted images using `severityError` option with `error` value", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        severityError: "error",
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using `severityError` option with `warning` value", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        severityError: "warning",
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(1);
    expect(errors).toHaveLength(0);
    expect(warnings[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using `severityError` option with `off` value", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        severityError: "off",
        minimizerOptions: { plugins },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);

    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using mode `production` and `severityError` option not specify value", async () => {
    const stats = await webpack({
      mode: "production",
      optimization: {
        emitOnErrors: true,
      },
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: { minimizerOptions: { plugins } },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      true
    );
  });

  it("should throws error on corrupted images using `severityError` option with `error` value and with custom function", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        severityError: "error",
        minify: (item) => {
          if (item.filename === "test-corrupted.jpg") {
            item.errors.push(new Error("Error"));
          }

          return item;
        },
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/Error/);
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      false
    );
  });

  it("should throws error on corrupted images using `severityError` option with `error` value and with custom function and do not pass pass the 'warnings' property", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        severityError: "error",
        minify: (item) => ({
          filename: item.filename,
          data: item.data,
          errors: [new Error("Error")],
        }),
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(2);
    expect(errors[0].message).toMatch(/Error/);
    expect(errors[1].message).toMatch(/Error/);
    expect(Object.keys(assets)).toHaveLength(3);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      false
    );
  });

  it("should throws error on corrupted images using `severityError` option with `error` value and with custom function and do not pass pass the 'errors' property", async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, "loader-corrupted.js"),
      imageminLoaderOptions: {
        severityError: "error",
        minify: (item) => ({
          filename: item.filename,
          data: item.data,
          warnings: [new Error("Error")],
        }),
      },
    });
    const { compilation } = stats;
    const { assets, warnings, errors } = compilation;

    expect(warnings).toHaveLength(2);
    expect(warnings[0].message).toMatch(/Error/);
    expect(warnings[1].message).toMatch(/Error/);
    expect(Object.keys(assets)).toHaveLength(3);
    expect(errors).toHaveLength(0);

    await expect(isOptimized("loader-test.png", compilation)).resolves.toBe(
      false
    );
  });
});
