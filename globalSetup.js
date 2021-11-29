"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = () =>
  Promise.resolve()
    .then(() => {
      const compiler = webpack({
        devtool: false,
        mode: "development",
        target: "node",
        entry: path.resolve(__dirname, "node_modules/imagemin/index.js"),
        output: {
          path: path.resolve(__dirname, "test/bundled/imagemin"),
          filename: "index.js",
          library: {
            type: "commonjs2",
          },
        },
      });

      return new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error) {
            reject(error);

            return;
          }

          // eslint-disable-next-line no-console
          console.log(stats.toString());

          compiler.close(() => {
            resolve();
          });
        });
      });
    })
    .then(() => {
      const compiler = webpack({
        devtool: false,
        mode: "development",
        target: "node",
        entry: path.resolve(__dirname, "node_modules/imagemin-svgo/index.js"),
        output: {
          path: path.resolve(__dirname, "test/bundled/imagemin-svgo"),
          filename: "index.js",
          library: {
            type: "commonjs2",
          },
        },
      });

      return new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error) {
            reject(error);

            return;
          }

          // eslint-disable-next-line no-console
          console.log(stats.toString());

          compiler.close(() => {
            resolve();
          });
        });
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
      process.exit(1);
    });
