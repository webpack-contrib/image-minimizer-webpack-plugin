import ImageminPlugin from "..";

describe("api", () => {
  describe("basic", () => {
    it("should exported", () => {
      expect(ImageminPlugin).toBeInstanceOf(Object);
      expect(typeof ImageminPlugin.loader).toBe("string");
      expect(typeof ImageminPlugin.normalizeConfig).toBe("function");
    });
  });

  describe("normalizeConfig", () => {
    it("should works", () => {
      expect(() =>
        ImageminPlugin.normalizeConfig({})
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageminPlugin.normalizeConfig({ plugins: [] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageminPlugin.normalizeConfig({ plugins: ["unknown"] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageminPlugin.normalizeConfig({ plugins: ["imagemin-unknown"] })
      ).toThrowErrorMatchingSnapshot();

      expect(
        ImageminPlugin.normalizeConfig({ plugins: ["mozjpeg"] })
      ).toMatchSnapshot();
      expect(
        ImageminPlugin.normalizeConfig({ plugins: ["imagemin-mozjpeg"] })
      ).toMatchSnapshot();
      expect(
        ImageminPlugin.normalizeConfig({ plugins: [["mozjpeg"]] })
      ).toMatchSnapshot();
      expect(
        ImageminPlugin.normalizeConfig({
          plugins: [["mozjpeg", { quality: 0 }]]
        })
      ).toMatchSnapshot();
    });
  });
});
