import path from 'path';

import fileType from 'file-type';

import { fixturesPath, webpack } from './helpers';

describe('loader filename option', () => {
  it('should transform image source to webp', async () => {
    const stats = await webpack({
      entry: path.join(fixturesPath, './loader-single.js'),
      output: {
        path: path.resolve(__dirname, 'outputs'),
      },
      imageminPluginOptions: {
        // Todo filename makes sense together with keepOriginal
        filename: '[path][name].webp',
        minimizerOptions: {
          plugins: ['imagemin-webp'],
        },
      },
    });
    const { compilation } = stats;
    const { warnings, errors } = compilation;

    const file = path.resolve(
      __dirname,
      'outputs',
      './nested/deep/loader-test.jpg'
    );
    const ext = await fileType.fromFile(file);

    expect(/image\/webp/i.test(ext.mime)).toBe(true);
    expect(warnings).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
