import imagemin from 'imagemin';

function runImagemin(source, imageminOptions) {
  return imagemin.buffer(source, imageminOptions);
}

export default runImagemin;
