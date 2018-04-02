import interpolateName from "../../src/utils/interpolate-name";
import test from "ava";

test("interpolateName", t => {
  [
    [
      "/app/js/javascript.js",
      "js/[hash].script.[ext]",
      "test content",
      "js/9473fdd0d880a43c21b7778d34872157.script.js"
    ],
    [
      "/app/page.html",
      "html-[hash:6].html",
      "test content",
      "html-9473fd.html"
    ],
    [
      "/app/flash.txt",
      "[hash]",
      "test content",
      "9473fdd0d880a43c21b7778d34872157"
    ],
    [
      "/app/img/image.png",
      "[sha512:hash:base64:7].[ext]",
      "test content",
      "2BKDTjl.png"
    ],
    [
      "/app/dir/file.png",
      "[path][name].[ext]?[hash]",
      "test content",
      "/app/dir/file.png?9473fdd0d880a43c21b7778d34872157"
    ],
    [
      "/vendor/test/images/loading.gif",
      path => path.replace(/\/?vendor\/?/, ""),
      "test content",
      "test/images/loading.gif"
    ],
    [
      "/pathWith.period/filename.js",
      "js/[name].[ext]",
      "test content",
      "js/filename.js"
    ],
    [
      "/pathWith.period/filenameWithoutExt",
      "js/[name].[ext]",
      "test content",
      "js/filenameWithoutExt.bin"
    ],
    [
      "test.js",
      "[path][name].[hash].[ext]",
      "test content",
      "test.9473fdd0d880a43c21b7778d34872157.js"
    ],
    [
      ".test.js",
      "[name].[hash].[ext]",
      "test content",
      ".test.9473fdd0d880a43c21b7778d34872157.js"
    ]
  ].forEach(testTemplate => {
    const interpolatedName = interpolateName(testTemplate[0], testTemplate[1], {
      content: testTemplate[2]
    });

    t.true(
      interpolatedName === testTemplate[3],
      `should interpolate ${testTemplate[0]} ${testTemplate[1]}`
    );
  });
});
