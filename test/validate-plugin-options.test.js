import ImageMinimizerPlugin from "../src";

describe("validate plugin options", () => {
  it("should work", () => {
    /* eslint-disable no-new */
    expect(() => {
      new ImageMinimizerPlugin({ test: /foo/ });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ test: "foo" });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ test: [/foo/] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ test: [/foo/, /bar/] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ test: ["foo", "bar"] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ test: [/foo/, "bar"] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ test: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ test: [true] });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ include: /foo/ });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ include: "foo" });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ include: [/foo/] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ include: [/foo/, /bar/] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ include: ["foo", "bar"] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ include: [/foo/, "bar"] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ include: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ include: [true] });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: /foo/ });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: "foo" });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: [/foo/] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: [/foo/, /bar/] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: ["foo", "bar"] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: [/foo/, "bar"] });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ exclude: [true] });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ severityError: false });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ severityError: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ severityError: "error" });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ severityError: () => {} });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ deleteOriginalAssets: false });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ deleteOriginalAssets: {} });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ deleteOriginalAssets: true });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {},
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {},
          },
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ minimizer: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          filter: () => true,
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          filter: true,
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            filter: () => true,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            filter: true,
          },
        ],
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          filename: "[name].[ext]",
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            filename: "[name].[ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          filename: () => "[name].[ext]",
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            filename: () => "[name].[ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          filename: true,
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          filename: true,
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {},
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "one",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {},
          },
          {
            preset: "two",
            implementation: ImageMinimizerPlugin.squooshGenerate,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ generator: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {},
            filter: () => true,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {},
            filter: true,
          },
        ],
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            filename: "[name].[ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            filename: () => "[name].[ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            filename: true,
          },
        ],
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ concurrency: 2 });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ concurrency: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ concurrency: "true" });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ loader: false });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ loader: true });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ loader: "true" });
    }).toThrowErrorMatchingSnapshot();
    /* eslint-enable no-new */
  });
});
