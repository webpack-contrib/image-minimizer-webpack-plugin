import path from 'path';

import fileType from 'file-type';

import { fixturesPath, webpack } from './helpers';

describe('plugin filename option', () => {
  it('should transform image to webp', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './empty-entry.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      emitPlugin: true,
      emitPluginOptions: { fileNames: ['./nested/deep/plugin-test.png'] },
      imageminPluginOptions: {
        filename: '[path][name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors, assets } = compilation;

    const transformedAssets = Object.keys(assets).filter((asset) =>
      asset.includes('./nested/deep/plugin-test.webp')
    );
    const file = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/plugin-test.webp'
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(transformedAssets).toHaveLength(1);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
