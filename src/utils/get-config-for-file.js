import normalizeConfig from './normalize-config';

function getConfigForFile(options, result) {
  // Implement autosearch config on root directory of project in future
  return normalizeConfig(options.imageminOptions, { options, result });
}

export default getConfigForFile;
