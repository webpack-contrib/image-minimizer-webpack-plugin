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
      new ImageMinimizerPlugin({ minimizerOptions: { filter: () => true } });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ minimizerOptions: { filter: () => false } });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ minimizerOptions: { filter: true } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ minimizerOptions: { filter: {} } });
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
      new ImageMinimizerPlugin({ minimizerOptions: {} });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ minimizerOptions: null });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizerOptions: { plugins: [] },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizerOptions: { filename: "[name].[ext]" },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizerOptions: { filename: () => "[name].[ext]" },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ minimizerOptions: { filename: true } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ minimizerOptions: { filename: {} } });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizerOptions: { deleteOriginalAssets: false },
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({
        minimizerOptions: { deleteOriginalAssets: {} },
      });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ maxConcurrency: 2 });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ maxConcurrency: true });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new ImageMinimizerPlugin({ maxConcurrency: "true" });
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

    expect(() => {
      new ImageMinimizerPlugin({
        minify: [ImageMinimizerPlugin.imageminMinify],
      });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ minify: ImageMinimizerPlugin.imageminMinify });
    }).not.toThrow();

    expect(() => {
      new ImageMinimizerPlugin({ minify: "true" });
    }).toThrowErrorMatchingSnapshot();
    /* eslint-enable no-new */
  });
});
