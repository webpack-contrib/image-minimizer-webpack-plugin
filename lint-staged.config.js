"use strict";

module.exports = {
  "*.{js,cjs,mjs,jsx}": [
    "prettier --list-different",
    "eslint --report-unused-disable-directives",
  ],
  "!(CHANGELOG).{md,markdown,mdown,mkdn,mkd,mdwn,mkdown,ron}": [
    "prettier --list-different",
    "eslint --report-unused-disable-directives",
    "remark -f -q",
  ],
  "*.{yml,yaml}": ["prettier --list-different"],
};
