import { isOptimized, plugins, runWebpack } from "./helpers";
import ImageMinimizerPlugin from "../src/index.js";

describe("plugin loader option", () => {
  it("should optimizes all images (plugin standalone)", async () => {
    const stats = await runWebpack({
      emitPlugin: true,
      imageminPluginOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        },
        loader: false,
      },
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
    await expect(isOptimized("plugin-test.jpg", compilation)).resolves.toBe(
      true
    );
  });
});
