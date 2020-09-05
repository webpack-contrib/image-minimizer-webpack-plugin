import path from 'path';

import fileType from 'file-type';

import { fixturesPath, webpack } from './helpers';

describe('loader filename option', () => {
  it('should transform image to webp', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './loader-single.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      imageminPluginOptions: {
        filename: '[name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const originalAssets = Object.keys(assets).filter((asset) =>
      /\.(jpe?g|png|gif|svg)$/i.test(asset)
    );

    const transformedAssets = Object.keys(assets).filter((asset) =>
      /\.webp/i.test(asset)
    );

    const file = path.resolve(__dirname, 'outputs', transformedAssets[0]);
    const ext = await fileType.fromFile(file);

    expect(originalAssets.length).toEqual(0);
    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
