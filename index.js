"use strict";

// eslint-disable-next-line node/no-unpublished-require
const ImageminPlugin = require("./src/ImageminPlugin");

ImageminPlugin.loader = require.resolve("./src/imagemin-loader.js");

module.exports = ImageminPlugin;
