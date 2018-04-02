"use strict";

const path = require("path");
const loaderUtils = require("loader-utils");

module.exports = (name, template, options) => {
  let resourcePath = name;
  let pathSepAdded = false;

  // A hack because loaderUtils.interpolateName doesn't
  // find the right path if no directory is defined
  // ie. [path] applied to 'file.txt' would return 'file'
  if (resourcePath.indexOf(path.sep) < 0) {
    resourcePath = path.sep + resourcePath;
    pathSepAdded = true;
  }

  let interpolateName = loaderUtils.interpolateName(
    {
      resourcePath
    },
    template,
    options
  );

  // Remove extra path separation
  if (pathSepAdded && /\[path\]/.test(template)) {
    interpolateName = interpolateName.slice(2);
  }

  return interpolateName;
};
