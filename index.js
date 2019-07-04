"use strict";

// eslint-disable-next-line node/no-unpublished-require
const ImageminPlugin = require("./src/ImageminPlugin");

// eslint-disable-next-line node/no-unpublished-require
ImageminPlugin.loader = require.resolve("./src/imagemin-loader.js");

module.exports = ImageminPlugin;
