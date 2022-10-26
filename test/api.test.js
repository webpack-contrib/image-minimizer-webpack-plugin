import ImageMinimizerPlugin from "../src/index";

describe("api", () => {
  describe("basic", () => {
    it("should exported", () => {
      expect(ImageMinimizerPlugin).toBeInstanceOf(Object);
      expect(typeof ImageMinimizerPlugin.loader).toBe("string");
      expect(typeof ImageMinimizerPlugin.imageminNormalizeConfig).toBe(
        "function"
      );
      expect(typeof ImageMinimizerPlugin.imageminMinify).toBe("function");
      expect(typeof ImageMinimizerPlugin.imageminGenerate).toBe("function");
      expect(typeof ImageMinimizerPlugin.squooshMinify).toBe("function");
      expect(typeof ImageMinimizerPlugin.squooshGenerate).toBe("function");
      expect(typeof ImageMinimizerPlugin.sharpMinify).toBe("function");
      expect(typeof ImageMinimizerPlugin.sharpGenerate).toBe("function");
    });
  });

  describe("normalizeImageminConfig", () => {
    it("should works", async () => {
      await expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({})
      ).rejects.toThrowErrorMatchingSnapshot();
      await expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: [] })
      ).rejects.toThrowErrorMatchingSnapshot();
      await expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: ["unknown"] })
      ).rejects.toThrowErrorMatchingSnapshot();
      await expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({
          plugins: ["imagemin-unknown"],
        })
      ).rejects.toThrowErrorMatchingSnapshot();
      await expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({})
      ).rejects.toThrowErrorMatchingSnapshot();
      await expect(() =>
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: [true] }, {})
      ).rejects.toThrowErrorMatchingSnapshot();

      await expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: ["mozjpeg"] })
      ).resolves.toMatchSnapshot();
      await expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({
          plugins: ["imagemin-mozjpeg"],
        })
      ).resolves.toMatchSnapshot();
      await expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({ plugins: [["mozjpeg"]] })
      ).resolves.toMatchSnapshot();
      await expect(
        ImageMinimizerPlugin.imageminNormalizeConfig({
          plugins: [["mozjpeg", { quality: 0 }]],
        })
      ).resolves.toMatchSnapshot();
    });
  });
});
