"use strict";

module.exports = {
  parserOptions: {
    sourceType: "script"
  },
  extends: ["plugin:itgalaxy/esnext", "plugin:itgalaxy/node"],
  overrides: [
    // Tests
    {
      extends: ["plugin:itgalaxy/jest"],
      excludedFiles: ["**/*.md"],
      files: ["**/__tests__/**/*", "**/__mocks__/**/*"],
      rules: {
        // Allow to use `console` (example - `mocking`)
        "no-console": "off",
        "node/no-unsupported-features/es-syntax": "off"
      }
    },

    // Markdown
    {
      extends: ["plugin:itgalaxy/markdown"],
      files: ["**/*.md"],
      parserOptions: {
        // Uncomment the next line if you want use `import/export` in documentation
        // sourceType: "module"
        ecmaFeatures: {
          impliedStrict: true
        }
      },
      rules: {
        strict: "off",
        "no-undef": "off",
        "no-unused-vars": "off",
        "no-process-env": "off",
        "no-process-exit": "off",
        "no-console": "off",
        "import/no-unresolved": "off",
        "node/no-unpublished-require": "off",
        "node/no-unpublished-import": "off",
        "node/no-unsupported-features/es-syntax": "off"
      }
    }
  ],
  root: true
};
