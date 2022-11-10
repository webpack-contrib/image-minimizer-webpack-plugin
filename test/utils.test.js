import { isAbsoluteURL, replaceFileExtension } from "../src/utils.js";

describe("utils", () => {
  it("should distinguish between relative and absolute file paths", () => {
    expect(isAbsoluteURL("/home/user/img.jpg")).toBe(true);
    expect(isAbsoluteURL("user/img.jpg")).toBe(false);
    expect(isAbsoluteURL("./user/img.jpg")).toBe(false);
    expect(isAbsoluteURL("../user/img.jpg")).toBe(false);

    expect(isAbsoluteURL("C:\\user\\img.jpg")).toBe(true);
    expect(isAbsoluteURL("CC:\\user\\img.jpg")).toBe(true);
    expect(isAbsoluteURL("user\\img.jpg")).toBe(false);
    expect(isAbsoluteURL(".\\user\\img.jpg")).toBe(false);
    expect(isAbsoluteURL("..\\user\\img.jpg")).toBe(false);

    expect(isAbsoluteURL("file:/user/img.jpg")).toBe(true);
    expect(isAbsoluteURL("file-url:/user/img.jpg")).toBe(true);
    expect(isAbsoluteURL("0file:/user/img.jpg")).toBe(false);
  });

  it("should replace file extension", () => {
    expect(replaceFileExtension("img.jpg", "png")).toBe("img.png");
    expect(replaceFileExtension(".img.jpg", "png")).toBe(".img.png");

    expect(replaceFileExtension("/user/img.jpg", "png")).toBe("/user/img.png");
    expect(replaceFileExtension("file:///user/img.jpg", "png")).toBe(
      "file:///user/img.png"
    );
    expect(replaceFileExtension("C:\\user\\img.jpg", "png")).toBe(
      "C:\\user\\img.png"
    );

    expect(replaceFileExtension("user/img.jpg", "png")).toBe("user/img.png");
    expect(replaceFileExtension("user\\img.jpg", "png")).toBe("user\\img.png");

    expect(replaceFileExtension("/user/img.jpg.gz", "png")).toBe(
      "/user/img.jpg.png"
    );
    expect(replaceFileExtension("file:///user/img.jpg.gz", "png")).toBe(
      "file:///user/img.jpg.png"
    );
    expect(replaceFileExtension("C:\\user\\img.jpg.gz", "png")).toBe(
      "C:\\user\\img.jpg.png"
    );

    expect(replaceFileExtension("/user/img", "png")).toBe("/user/img");
    expect(replaceFileExtension("file:///user/img", "png")).toBe(
      "file:///user/img"
    );
    expect(replaceFileExtension("C:\\user\\img", "png")).toBe("C:\\user\\img");

    expect(replaceFileExtension("/user/.img", "png")).toBe("/user/.png");
    expect(replaceFileExtension("file:///user/.img", "png")).toBe(
      "file:///user/.png"
    );
    expect(replaceFileExtension("C:\\user\\.img", "png")).toBe(
      "C:\\user\\.png"
    );

    expect(replaceFileExtension("/use.r/img", "png")).toBe("/use.r/img");
    expect(replaceFileExtension("file:///use.r/img", "png")).toBe(
      "file:///use.r/img"
    );
    expect(replaceFileExtension("C:\\use.r\\img", "png")).toBe(
      "C:\\use.r\\img"
    );

    expect(replaceFileExtension("C:\\user/img.jpg", "png")).toBe(
      "C:\\user/img.png"
    );
  });
});
