import fs from 'fs';
import path from 'path';

import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminSvgo from 'imagemin-svgo';
import pify from 'pify';

import minify from '../src/minify';

function isPromise(obj) {
  return (
    Boolean(obj) &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

describe('minify', () => {
  it('minify should be is function', () =>
    expect(typeof minify === 'function').toBe(true));

  it('should return `Promise`', () =>
    expect(
      isPromise(
        minify([{ input: Buffer.from('Foo') }], {
          minimizerOptions: { plugins: ['mozjpeg'] },
        })
      )
    ).toBe(true));

  it('should optimize', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize (relative filename)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify(
      [{ input, filename: path.relative(process.cwd(), filename) }],
      {
        minimizerOptions: {
          plugins: ['mozjpeg'],
        },
      }
    );

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(path.relative(process.cwd(), filename));

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize multiple images', async () => {
    const firstFilename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const secondFilename = path.resolve(
      __dirname,
      './fixtures/loader-test.jpg'
    );
    const firstInput = await pify(fs.readFile)(firstFilename);
    const secondInput = await pify(fs.readFile)(secondFilename);
    const result = await minify(
      [
        { input: firstInput, filename: firstFilename },
        { input: secondInput, filename: secondFilename },
      ],
      {
        minimizerOptions: { plugins: ['mozjpeg'] },
      }
    );

    expect(result).toHaveLength(2);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[1].warnings).toHaveLength(0);
    expect(result[1].errors).toHaveLength(0);

    const optimizedFirstSource = await imagemin.buffer(firstInput, {
      plugins: [imageminMozjpeg()],
    });
    const optimizedSecondSource = await imagemin.buffer(firstInput, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedFirstSource)).toBe(true);
    expect(result[1].output.source().equals(optimizedSecondSource)).toBe(true);
  });

  it('should return optimized image even when optimized image large then original', async () => {
    const svgoOptions = {
      plugins: [
        {
          addAttributesToSVGElement: {
            attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
          },
        },
      ],
    };

    const filename = path.resolve(
      __dirname,
      './fixtures/large-after-optimization.svg'
    );
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: [['svgo', svgoOptions]] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should not throw error on empty', async () => {
    const result = await minify();

    expect(result).toHaveLength(0);
  });

  it('should throw error on empty', async () => {
    const result = await minify([{}]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect(result[0].errors[0].toString()).toMatch(/Empty input/);
    expect(result[0].filename).toBeUndefined();
    expect(result[0].input).toBeUndefined();
    expect(result[0].output).toBeUndefined();
  });

  it('should throw error on empty `imagemin` options', async () => {
    const input = Buffer.from('Foo');
    const filename = path.resolve('foo.png');
    const result = await minify([{ input, filename }]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);
  });

  it('should throw error on empty `imagemin.plugins` options', async () => {
    const input = Buffer.from('Foo');
    const filename = path.resolve('foo.png');
    const result = await minify([
      { input, filename, minimizerOptions: { plugins: [] } },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);
  });

  it('should throw error on invalid `imagemin.plugins` options', async () => {
    const input = Buffer.from('Foo');
    const filename = path.resolve('foo.png');
    const result = await minify([
      { input, filename, minimizerOptions: { plugins: false } },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /No plugins found for `imagemin`/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);
  });

  it('should throw warning on broken image (no `bail` option)', async () => {
    const filename = path.resolve(__dirname, './fixtures/test-corrupted.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].errors).toHaveLength(0);
    expect([...result[0].warnings][0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(result[0].output.source().equals(input)).toBe(true);
  });

  it('should throw warning on broken image (`bail` option with `false` value)', async () => {
    const filename = path.resolve(__dirname, './fixtures/test-corrupted.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: false,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].errors).toHaveLength(0);
    expect([...result[0].warnings][0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(result[0].output.source().equals(input)).toBe(true);
  });

  it('should throw error on broken image (`bail` option with `true` value)', async () => {
    const filename = path.resolve(__dirname, './fixtures/test-corrupted.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: true,
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect([...result[0].errors][0].message).toMatch(
      /(Corrupt JPEG data|Command failed with EPIPE)/
    );
    expect(result[0].output.source().equals(input)).toBe(true);
  });

  it('should return original content on invalid content (`String`)', async () => {
    const input = 'Foo';
    const result = await minify([{ input, filename: 'foo.jpg' }], {
      minimizerOptions: { plugins: ['mozjpeg'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.source().toString()).toBe(input);
  });

  it('should not optimize filtered', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: ['mozjpeg'] },
      filter: (source, sourcePath) => {
        expect(source).toBeInstanceOf(Buffer);
        expect(typeof sourcePath).toBe('string');

        if (source.byteLength === 631) {
          return false;
        }

        return true;
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].output.source().equals(input)).toBe(true);
    expect(result[0].filename).toBe(filename);
    expect(result[0].filtered).toBe(true);
  });

  it('should optimize (configuration using `function`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `string`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['mozjpeg', { quality: 0 }]],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg({ quality: 0 })],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array` without options)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['mozjpeg']],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `string` with full name)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['imagemin-mozjpeg'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array` with full name)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['imagemin-mozjpeg', { quality: 0 }]],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg({ quality: 0 })],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize (configuration using `array` with full name and without options)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [['imagemin-mozjpeg']],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should throw warning on empty `imagemin` options (configuration using `string`) (`bail` is not specify)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(path.resolve(filename));
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw error on empty `imagemin` options (configuration using `string`) (`bail` is `true`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: true,
      minimizerOptions: {
        plugins: ['unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect(result[0].errors[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw warning on empty `imagemin` options (configuration using `string`) (`bail` is `false`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: false,
      minimizerOptions: {
        plugins: ['unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw error on empty `imagemin` options (configuration using `string` and starting with `imagemin`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['imagemin-unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should optimize and throw error on unknown plugin (configuration using `string`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: ['imagemin-mozjpeg', 'unknown'],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Unknown plugin: imagemin-unknown/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should optimize and throw warning on using `Function` configuration', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: {
        plugins: [imageminMozjpeg()],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Do not use a function as plugin/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].input).toBeInstanceOf(Buffer);
    expect(result[0].filename).toBe(filename);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminMozjpeg()],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });

  it('should throw error on invalid plugin configuration (`bail` is `true`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: true,
      minimizerOptions: {
        plugins: [{ foo: 'bar' }],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(1);
    expect(result[0].errors[0].toString()).toMatch(
      /Invalid plugin configuration/
    );
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should throw warning on invalid plugin configuration (`bail` is `false`)', async () => {
    const filename = path.resolve(__dirname, './fixtures/loader-test.jpg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      bail: false,
      minimizerOptions: {
        plugins: [{ foo: 'bar' }],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(1);
    expect(result[0].warnings[0].toString()).toMatch(
      /Invalid plugin configuration/
    );
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].filename).toBe(filename);
    expect(result[0].input.equals(input)).toBe(true);
    expect(result[0].output.source().equals(input)).toBe(true);

    expect(result).toHaveLength(1);
  });

  it('should support svgo options', async () => {
    const svgoOptions = {
      plugins: [
        {
          cleanupIDs: {
            prefix: 'qwerty',
          },
        },
      ],
    };

    const filename = path.resolve(__dirname, './fixtures/svg-with-id.svg');
    const input = await pify(fs.readFile)(filename);
    const result = await minify([{ input, filename }], {
      minimizerOptions: { plugins: [['svgo', svgoOptions]] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].warnings).toHaveLength(0);
    expect(result[0].errors).toHaveLength(0);

    const optimizedSource = await imagemin.buffer(input, {
      plugins: [imageminSvgo(svgoOptions)],
    });

    expect(result[0].output.source().equals(optimizedSource)).toBe(true);
  });
});
