import imagemin from 'imagemin';

function runImagemin(source, minimizerOptions) {
  return imagemin.buffer(source, minimizerOptions);
}

export default runImagemin;
