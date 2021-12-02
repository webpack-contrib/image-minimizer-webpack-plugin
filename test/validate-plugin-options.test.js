import ImageMinimizerPlugin from "../src";

describe("validate plugin options", () => {
  it("should work", () => {
    /* eslint-disable no-new */
    expect(() => {
      new ImageMinimizerPlugin({
        test: /foo/,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: "foo",
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [/foo/],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [/foo/, /bar/],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: ["foo", "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [/foo/, "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [true],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        include: /foo/,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: "foo",
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [/foo/],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [/foo/, /bar/],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: ["foo", "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [/foo/, "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [true],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: /foo/,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: "foo",
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [/foo/],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [/foo/, /bar/],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: ["foo", "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [/foo/, "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [true],
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: "error",
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: () => {},
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        deleteOriginalAssets: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        deleteOriginalAssets: {},
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        deleteOriginalAssets: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
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
      new ImageMinimizerPlugin({
        concurrency: 2,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        concurrency: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        concurrency: "true",
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        loader: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        loader: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        loader: "true",
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();
    /* eslint-enable no-new */
  });
});
