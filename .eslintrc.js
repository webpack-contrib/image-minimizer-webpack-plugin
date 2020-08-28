"use strict";

module.exports = {
  extends: [
    "plugin:itgalaxy/script",
    "plugin:itgalaxy/esnext",
    "plugin:itgalaxy/node",
  ],
  overrides: [
    // Tests
    {
      extends: ["plugin:itgalaxy/dirty", "plugin:itgalaxy/jest"],
      excludedFiles: ["**/*.md"],
      files: ["**/test/**/*", "**/__mocks__/**/*"],
      rules: {
        // Allow to use `console` (example - `mocking`)
        "no-console": "off",
        "node/no-unsupported-features/es-syntax": [
          "error",
          { ignores: ["modules", "dynamicImport"] },
        ],
      },
    },

    // Markdown
    {
      extends: ["plugin:itgalaxy/dirty", "plugin:itgalaxy/markdown"],
      files: ["**/*.md"],
      rules: {
        "no-unused-vars": "off",
        "no-console": "off",
        "import/no-unresolved": "off",
        "node/no-unpublished-require": "off",
        "node/no-unpublished-import": "off",
        "node/no-unsupported-features/es-syntax": [
          "error",
          { ignores: ["modules", "dynamicImport"] },
        ],
      },
    },
  ],
  root: true,
};
