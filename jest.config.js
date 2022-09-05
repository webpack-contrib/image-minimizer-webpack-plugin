"use strict";

module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^imagemin$": "<rootDir>/test/bundled/imagemin/index.js",
    "^imagemin-svgo$": "<rootDir>/test/bundled/imagemin-svgo/index.js",
    "^node:buffer$": "<rootDir>/test/helpers/built-in-modules/buffer.js",
    "^node:fs$": "<rootDir>/test/helpers/built-in-modules/fs.js",
    "^node:util$": "<rootDir>/test/helpers/built-in-modules/util.js",
    "^node:path$": "<rootDir>/test/helpers/built-in-modules/path.js",
    "^node:stream$": "<rootDir>/test/helpers/built-in-modules/stream.js",
    "^node:url$": "<rootDir>/test/helpers/built-in-modules/url.js",
    "^node:process$": "<rootDir>/test/helpers/built-in-modules/url.js",
  },
  collectCoverageFrom: ["src/**/*.{js,mjs,jsx}"],
  globalSetup: "<rootDir>/globalSetup.js",
};
