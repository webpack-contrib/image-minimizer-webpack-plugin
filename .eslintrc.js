"use strict";

module.exports = {
  extends: [
    "plugin:itgalaxy/script",
    "plugin:itgalaxy/node",
    "plugin:itgalaxy/esnext",
    "plugin:itgalaxy/markdown",
    "plugin:itgalaxy/jest",
  ],
  overrides: [
    // Tests
    {
      extends: ["plugin:itgalaxy/dirty"],
      files: [
        "src/**/*.[j]s?(x)",
        "**/{tests,test,__tests__}/**/*.[j]s?(x)",
        "**/?(*.)+(spec|test).[j]s?(x)",
        "**/test-*.[j]s?(x)",
      ],
      rules: {
        "jest/no-standalone-expect": [
          "error",
          { additionalTestBlockFunctions: ["ifit"] },
        ],
        "jest/require-hook": [
          "error",
          {
            allowedFunctionCalls: ["ifit"],
          },
        ],
      },
    },
  ],
  rules: {
    "unicorn/filename-case": "off",
  },
  root: true,
};
