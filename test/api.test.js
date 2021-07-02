import ImageMinimizerPlugin from "../src/index";

describe("api", () => {
  describe("basic", () => {
    it("should exported", () => {
      expect(ImageMinimizerPlugin).toBeInstanceOf(Object);
      expect(typeof ImageMinimizerPlugin.loader).toBe("string");
      expect(typeof ImageMinimizerPlugin.loader).toBe("string");
      expect(typeof ImageMinimizerPlugin.imageminNormalizeConfig).toBe(
        "function"
      );
      expect(typeof ImageMinimizerPlugin.imageminMinify).toBe("function");
      expect(typeof ImageMinimizerPlugin.imageminGenerate).toBe("function");
      expect(typeof ImageMinimizerPlugin.squooshMinify).toBe("function");
      expect(typeof ImageMinimizerPlugin.squooshGenerate).toBe("function");
    });
  });

  describe("imageminNormalizeConfig", () => {
    it("should works", () => {
      expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({})
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: [] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: ["unknown"] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({
          plugins: ["imagemin-unknown"],
        })
      ).toThrowErrorMatchingSnapshot();

      expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: ["mozjpeg"] })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({
          plugins: ["imagemin-mozjpeg"],
        })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: [["mozjpeg"]] })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({
          plugins: [["mozjpeg", { quality: 0 }]],
        })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({}, {})
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: [true] }, {})
      ).toMatchSnapshot();
    });
  });
});
