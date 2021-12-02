import path from "path";

import ImageMinimizerPlugin from "../src";

import { fixturesPath, plugins, runWebpack } from "./helpers";

describe("validate loader options", () => {
  const tests = {
    minimizer: {
      success: [
        {
          implementation: ImageMinimizerPlugin.squooshMinify,
        },
        {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 90,
              },
            },
          },
        },
        [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
          },
        ],
        [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {
              encodeOptions: {
                mozjpeg: {
                  quality: 90,
                },
              },
            },
          },
        ],
        [
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
          },
          {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {
              encodeOptions: {
                mozjpeg: {
                  quality: 90,
                },
              },
            },
          },
        ],
      ],
      failure: [1, true, false, null, []],
    },
    generator: {
      success: [
        [
          {
            implementation: ImageMinimizerPlugin.squooshGenerate,
          },
        ],
        [
          {
            implementation: ImageMinimizerPlugin.squooshGenerate,
          },
          {
            implementation: ImageMinimizerPlugin.squooshGenerate,
          },
        ],
      ],
      failure: [1, true, false, null, []],
    },
    filter: {
      success: [() => false],
      failure: [1, true, false, {}, [], null],
    },
    severityError: {
      success: ["error"],
      failure: [true, false, {}, [], () => {}],
    },
    filename: {
      success: ["[name].[ext]", () => "[name].[ext]"],
      failure: [{}, [], true],
    },
    unknown: {
      success: [],
      failure: [1, true, false, "test", /test/, [], {}, { foo: "bar" }],
    },
  };

  function stringifyValue(value) {
    if (
      Array.isArray(value) ||
      (value && typeof value === "object" && value.constructor === Object)
    ) {
      return JSON.stringify(value);
    }

    return value;
  }

  function createTestCase(key, value, type) {
    it(`should ${
      type === "success" ? "successfully validate" : "throw an error on"
    } the "${key}" option with "${stringifyValue(value)}" value`, async () => {
      const options = {
        entry: path.join(fixturesPath, "validate-options.js"),
        imageminLoaderOptions: {
          [key]: value,
        },
      };

      if (key !== "minimizer") {
        options.imageminLoaderOptions.minimizer = {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: { plugins },
        };
      }

      let stats;

      try {
        stats = await runWebpack(options);
      } finally {
        const shouldSuccess = type === "success";
        const {
          compilation: { errors },
        } = stats;

        expect(stats.hasErrors()).toBe(!shouldSuccess);
        expect(errors).toHaveLength(shouldSuccess ? 0 : 1);

        if (!shouldSuccess) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(() => {
            throw new Error(errors[0].error.message);
          }).toThrowErrorMatchingSnapshot();
        }
      }
    });
  }

  for (const [key, values] of Object.entries(tests)) {
    for (const type of Object.keys(values)) {
      for (const value of values[type]) {
        createTestCase(key, value, type);
      }
    }
  }
});
