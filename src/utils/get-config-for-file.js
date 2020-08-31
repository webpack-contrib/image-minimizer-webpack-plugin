import normalizeConfig from './normalize-config';

function getConfigForFile(options, result) {
  // Implement autosearch config on root directory of project in future
  return normalizeConfig(options.minimizerOptions, { options, result });
}

export default getConfigForFile;
