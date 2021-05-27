module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.{js,mjs,jsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/fixtures/", "helpers.js"],
};
