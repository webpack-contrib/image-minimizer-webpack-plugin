import ImageMinimizerPlugin from '../src/index';

describe('api', () => {
  describe('basic', () => {
    it('should exported', () => {
      expect(ImageMinimizerPlugin).toBeInstanceOf(Object);
      expect(typeof ImageMinimizerPlugin.loader).toBe('string');
      expect(typeof ImageMinimizerPlugin.normalizeImageminConfig).toBe(
        'function'
      );
    });
  });

  describe('normalizeConfig', () => {
    it('should works', () => {
      expect(() =>
        ImageMinimizerPlugin.normalizeImageminConfig({})
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.normalizeImageminConfig({ plugins: [] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.normalizeImageminConfig({ plugins: ['unknown'] })
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        ImageMinimizerPlugin.normalizeImageminConfig({
          plugins: ['imagemin-unknown'],
        })
      ).toThrowErrorMatchingSnapshot();

      expect(
        ImageMinimizerPlugin.normalizeImageminConfig({ plugins: ['mozjpeg'] })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.normalizeImageminConfig({
          plugins: ['imagemin-mozjpeg'],
        })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.normalizeImageminConfig({ plugins: [['mozjpeg']] })
      ).toMatchSnapshot();
      expect(
        ImageMinimizerPlugin.normalizeImageminConfig({
          plugins: [['mozjpeg', { quality: 0 }]],
        })
      ).toMatchSnapshot();
    });
  });
});
