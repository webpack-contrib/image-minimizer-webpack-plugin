import { isOptimized, plugins, webpack } from "./helpers";

describe("loader filter option", () => {
  it("should optimizes all images exclude filtered", async () => {
    const stats = await webpack({
      imageminLoaderOptions: {
        minimizerOptions: {
          filter: (item) => {
            expect(item.filename).toBeDefined();
            expect(item.data).toBeDefined();
            expect(item.warnings).toBeDefined();
            expect(item.errors).toBeDefined();

            if (item.data.byteLength === 631) {
              return false;
            }

            return true;
          },
          plugins,
        },
      },
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
