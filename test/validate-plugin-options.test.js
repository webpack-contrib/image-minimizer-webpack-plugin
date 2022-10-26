import ImageMinimizerPlugin from "../src";

describe("validate plugin options", () => {
  it("should work", () => {
    /* eslint-disable no-new */
    expect(() => {
      new ImageMinimizerPlugin({
        test: /foo/,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: "foo",
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [/foo/],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [/foo/, /bar/],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: ["foo", "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [/foo/, "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        test: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        test: [true],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        include: /foo/,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: "foo",
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [/foo/],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [/foo/, /bar/],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: ["foo", "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [/foo/, "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        include: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        include: [true],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: /foo/,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: "foo",
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [/foo/],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [/foo/, /bar/],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: ["foo", "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [/foo/, "bar"],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        exclude: [true],
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: "error",
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        severityError: () => {},
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        deleteOriginalAssets: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        deleteOriginalAssets: {},
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        deleteOriginalAssets: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {},
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {},
          },
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
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
          implementation: ImageMinimizerPlugin.sharpMinify,
          filter: () => true,
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          filter: true,
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            filter: () => true,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            filter: true,
          },
        ],
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          filename: "[name].[ext]",
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            filename: "[name].[ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          filename: () => "[name].[ext]",
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            filename: () => "[name].[ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          filename: true,
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          filename: true,
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
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
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {},
          },
          {
            preset: "two",
            implementation: ImageMinimizerPlugin.sharpGenerate,
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
            implementation: ImageMinimizerPlugin.sharpGenerate,
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
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {},
            filename: "[name][ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {},
            filename: () => "[name][ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {},
            filename: true,
          },
        ],
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
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
            type: "import",
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {},
            filename: () => "[name][ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            type: "asset",
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {},
            filename: () => "[name][ext]",
          },
        ],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        generator: [
          {
            type: "foo",
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {},
            filename: true,
          },
        ],
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        concurrency: 2,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        concurrency: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        concurrency: "true",
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        loader: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        loader: true,
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        loader: "true",
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {},
        },
      });
    }).toThrowErrorMatchingSnapshot();
    /* eslint-enable no-new */
  });
});
