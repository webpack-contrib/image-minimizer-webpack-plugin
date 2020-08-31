import ImageMinimizerPlugin from '../src/index';

describe('api', () => {
  describe('basic', () => {
    it('should exported', () => {
      expect(ImageMinimizerPlugin).toBeInstanceOf(Object);
      expect(typeof ImageMinimizerPlugin.loader).toBe('string');
      expect(typeof ImageMinimizerPlugin.normalizeConfig).toBe('function');
    });
  });

  describe('normalizeConfig', () => {
    it('should works', () => {
      expect(() =>
        ImageMinimizerPlugin.normalizeConfig({})
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.normalizeConfig({ plugins: [] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.normalizeConfig({ plugins: ['unknown'] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.normalizeConfig({ plugins: ['imagemin-unknown'] })
      ).toThrowErrorMatchingSnapshot();

      expect(
        ImageMinimizerPlugin.normalizeConfig({ plugins: ['mozjpeg'] })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.normalizeConfig({ plugins: ['imagemin-mozjpeg'] })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.normalizeConfig({ plugins: [['mozjpeg']] })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.normalizeConfig({
          plugins: [['mozjpeg', { quality: 0 }]],
        })
      ).toMatchSnapshot();
    });
  });
});
