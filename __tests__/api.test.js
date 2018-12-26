import ImageminPlugin from "..";

describe("api", () => {
  it("should provided", () => {
    expect(ImageminPlugin).toBeInstanceOf(Object);
    expect(typeof ImageminPlugin.loader).toBe("string");
  });
});
