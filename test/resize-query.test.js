import path from "path";
import { promisify } from "util";
import fileType from "file-type";
import imageSize from "image-size";
import ImageMinimizerPlugin from "../src";

import { runWebpack, fixturesPath } from "./helpers";

jest.setTimeout(20000);

describe("resize query", () => {
  it("should generate and resize with resize options", async () => {
    const stats = await runWebpack({
      entry: path.join(
        fixturesPath,
        "./generator-and-minimizer-resize-query.js"
      ),
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            resize: {
              width: 400,
              height: 400,
            },
            sizeSuffix: (width, height) => `-${width}x${height}`,
            encodeOptions: {
              png: {},
            },
          },
        },
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              resize: {
                width: 400,
                height: 400,
              },
              sizeSuffix: (width, height) => `-${width}x${height}`,
              encodeOptions: {
                webp: {},
              },
            },
          },
        ],
      },
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;
    const sizeOf = promisify(imageSize);

    const assetsList = [
      // asset path, width, height, mime regExp
      ["./loader-test-100x400.png", 100, 400, /image\/png/i],
      ["./loader-test-150x400.png", 150, 400, /image\/png/i],
      ["./loader-test-400x200.png", 400, 200, /image\/png/i],
      ["./loader-test-400x250.png", 400, 250, /image\/png/i],
      ["./loader-test-300x300.png", 300, 300, /image\/png/i],
      ["./loader-test-350x350.png", 350, 350, /image\/png/i],

      ["./loader-test-100x400.webp", 100, 400, /image\/webp/i],
      ["./loader-test-150x400.webp", 150, 400, /image\/webp/i],
      ["./loader-test-400x200.webp", 400, 200, /image\/webp/i],
      ["./loader-test-400x250.webp", 400, 250, /image\/webp/i],
      ["./loader-test-300x300.webp", 300, 300, /image\/webp/i],
      ["./loader-test-350x350.webp", 350, 350, /image\/webp/i],
    ];

    for await (const [assetPath, width, height, mimeRegExp] of assetsList) {
      const transformedAsset = path.resolve(
        __dirname,
        compilation.options.output.path,
        assetPath
      );

      const transformedExt = await fileType.fromFile(transformedAsset);
      const dimensions = await sizeOf(transformedAsset);

      expect(dimensions.width).toBe(width);
      expect(dimensions.height).toBe(height);
      expect(mimeRegExp.test(transformedExt.mime)).toBe(true);
      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);
    }
  });

  it("should generate and resize without resize options", async () => {
    const stats = await runWebpack({
      entry: path.join(
        fixturesPath,
        "./generator-and-minimizer-resize-query.js"
      ),
      imageminLoaderOptions: {
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            sizeSuffix: (width, height) => `-${width}x${height}`,
            encodeOptions: {
              png: {},
            },
          },
        },
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.squooshGenerate,
            options: {
              sizeSuffix: (width, height) => `-${width}x${height}`,
              encodeOptions: {
                webp: {},
              },
            },
          },
        ],
      },
    });

    const { compilation } = stats;
    const { warnings, errors } = compilation;
    const sizeOf = promisify(imageSize);

    /*
    require("./loader-test.png?width=100");
    require("./loader-test.png?w=150");
    require("./loader-test.png?height=200");
    require("./loader-test.png?h=250");
    require("./loader-test.png?width=300&height=auto");
    require("./loader-test.png?width=350&height=350");

    */

    const assetsList = [
      // asset path, width, height, mime regExp
      ["./loader-test-100x100.png", 100, 100, /image\/png/i],
      ["./loader-test-150x150.png", 150, 150, /image\/png/i],
      ["./loader-test-200x200.png", 200, 200, /image\/png/i],
      ["./loader-test-250x250.png", 250, 250, /image\/png/i],
      ["./loader-test-300x300.png", 300, 300, /image\/png/i],
      ["./loader-test-350x350.png", 350, 350, /image\/png/i],

      ["./loader-test-100x100.webp", 100, 100, /image\/webp/i],
      ["./loader-test-150x150.webp", 150, 150, /image\/webp/i],
      ["./loader-test-200x200.webp", 200, 200, /image\/webp/i],
      ["./loader-test-250x250.webp", 250, 250, /image\/webp/i],
      ["./loader-test-300x300.webp", 300, 300, /image\/webp/i],
      ["./loader-test-350x350.webp", 350, 350, /image\/webp/i],
    ];

    for await (const [assetPath, width, height, mimeRegExp] of assetsList) {
      const transformedAsset = path.resolve(
        __dirname,
        compilation.options.output.path,
        assetPath
      );

      const transformedExt = await fileType.fromFile(transformedAsset);
      const dimensions = await sizeOf(transformedAsset);

      expect(dimensions.width).toBe(width);
      expect(dimensions.height).toBe(height);
      expect(mimeRegExp.test(transformedExt.mime)).toBe(true);
      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);
    }
  });
});
