import { defineConfig } from "eslint/config";
import configs from "eslint-config-webpack/configs.js";
import jest from "eslint-plugin-jest";

export default defineConfig([
  {
    extends: [configs["recommended-dirty"]],
    plugins: {
      jest,
    },
    rules: {
      "jest/no-standalone-expect": [
        "error",
        { additionalTestBlockFunctions: ["ifit"] },
      ],
    },
  },
]);
