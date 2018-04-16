"use strict";

module.exports = (str, token) => {
  const idx = str.indexOf(token);

  return idx < 0 ? "" : str.substr(idx);
};
