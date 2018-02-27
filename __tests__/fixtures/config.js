export default {
  context: __dirname,
  entry: "./loader.js",
  mode: "development",
  module: {
    rules: [
      {
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]"
        },
        test: /\.txt$/i
      }
    ]
  },
  output: {
    filename: "bundle.js"
  }
};
