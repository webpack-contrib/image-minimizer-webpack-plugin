"use strict";

module.exports = {
  "*.{js,mjs,jsx}": [
    "prettier --list-different",
    "eslint --report-unused-disable-directives",
    "git add"
  ],
  "!(CHANGELOG).{md,markdown,mdown,mkdn,mkd,mdwn,mkdown,ron}": [
    "prettier --list-different",
    "eslint --report-unused-disable-directives",
    "remark -f -q",
    "git add"
  ],
  "*.{yml,yaml}": ["prettier --list-different", "git add"]
};
