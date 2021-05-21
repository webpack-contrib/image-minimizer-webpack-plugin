import imagemin from 'imagemin';

import normalizeConfig from './normalize-config';

export default async function imageminMinify(
  input,
  minimizerOptions,
  metaData
) {
  // Implement autosearch config on root directory of project in future
  const minimizerOptionsNormalized = normalizeConfig(
    minimizerOptions,
    metaData
  );

  return imagemin.buffer(input, minimizerOptionsNormalized);
}
