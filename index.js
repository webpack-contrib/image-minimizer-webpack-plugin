"use strict";

// eslint-disable-next-line node/no-unpublished-require
const ImageminWebpackPlugin = require("./src/ImageminWebpackPlugin");

module.exports = {
  ImageminWebpackPlugin,
  imageminLoader: require.resolve("./src/imagemin-loader")
};
