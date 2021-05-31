import src from "../src";
import cjs from "../src/cjs";

describe("cjs", () => {
  it("should export loader", () => {
    expect(cjs).toEqual(src);
  });
});
