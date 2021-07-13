import path from "path";

import ImageMinimizerPlugin from "../src";

import { fixturesPath, plugins, webpack } from "./helpers";

describe("validate loader options", () => {
  const tests = {
    minify: {
      success: [
        ImageMinimizerPlugin.imageminMinify,
        [ImageMinimizerPlugin.imageminMinify],
      ],
      failure: [1, true, false, null],
    },
    minimizerOptions: {
      success: [
        { plugins: [] },
        {},
        {
          filename: "[name].[ext]",
        },
        {
          filename: () => "[name].[ext]",
        },
        {
          deleteOriginal: true,
        },
        {
          filter: () => {},
        },
      ],
      failure: [
        1,
        true,
        false,
        [],
        null,
        {
          filename: [],
        },
        {
          filename: {},
        },
        {
          filename: true,
        },
        {
          deleteOriginal: {},
        },
        {
          deleteOriginal: [],
        },
        {
          deleteOriginal: () => {},
        },
        {
          filter: 1,
        },
        {
          filter: true,
        },
        {
          filter: {},
        },
        {
          filter: [],
        },
        {
          filter: null,
        },
      ],
    },
    severityError: {
      success: ["error"],
      failure: [true, false, {}, [], () => {}],
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

      if (key === "severityError") {
        options.imageminLoaderOptions.minimizerOptions = { plugins };
      }

      let stats;

      try {
        stats = await webpack(options);
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
