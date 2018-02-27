"use strict";

const ImageminWebpackPlugin = require("./ImageminWebpackPlugin");

module.exports = {
  ImageminWebpackPlugin,
  imageminLoader: require.resolve("./imagemin-loader")
};
