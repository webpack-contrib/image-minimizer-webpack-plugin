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
    },
  ],
  rules: {
    "unicorn/filename-case": "off",
    "jest/no-disabled-tests": "off",
  },
  root: true,
};
