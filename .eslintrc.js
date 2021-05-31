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
        "src/**/*.[jt]s?(x)",
        "**/{tests,test,__tests__}/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)",
        "**/test-*.[jt]s?(x)",
      ],
    },
  ],
  rules: {
    "unicorn/filename-case": "off",
  },
  root: true,
};
