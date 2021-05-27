import imagemin from 'imagemin';

import { klona } from 'klona/full';

export default async function imageminMinify(data, minimizerOptions) {
  const [[, input]] = Object.entries(data);
  const result = {
    code: input,
    warnings: [],
    errors: [],
  };

  // Implement autosearch config on root directory of project in future
  const minimizerOptionsNormalized = normalizeImageminConfig(
    minimizerOptions,
    result
  );

  try {
    result.code = await imagemin.buffer(input, minimizerOptionsNormalized);
  } catch (error) {
    result.errors.push(error);
  }

  return result;
}

class InvalidConfigError extends Error {}

function log(error, metaData, type) {
  if (metaData) {
    if (type === 'error') {
      if (typeof metaData.errors === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        metaData.errors = [];
      }

      // eslint-disable-next-line no-param-reassign
      error.name = 'ConfigurationError';

      metaData.errors.push(error);
    } else {
      if (typeof metaData.warnings === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        metaData.warnings = [];
      }

      metaData.warnings.push(error);
    }

    return;
  }

  throw error;
}

export function normalizeImageminConfig(minimizerOptions, metaData) {
  if (
    !minimizerOptions ||
    !minimizerOptions.plugins ||
    (minimizerOptions.plugins && minimizerOptions.plugins.length === 0)
  ) {
    log(
      new Error('No plugins found for `imagemin`. Please read documentation.'),
      metaData
    );

    return minimizerOptions;
  }

  const imageminConfig = klona(minimizerOptions);

  if (!imageminConfig.pluginsMeta) {
    imageminConfig.pluginsMeta = [];
  }

  imageminConfig.plugins = imageminConfig.plugins
    .map((plugin) => {
      const isPluginArray = Array.isArray(plugin);

      if (typeof plugin === 'string' || isPluginArray) {
        const pluginName = isPluginArray ? plugin[0] : plugin;
        // eslint-disable-next-line no-undefined
        const pluginOptions = isPluginArray ? plugin[1] : undefined;

        let requiredPlugin = null;
        let requiredPluginName = `imagemin-${pluginName}`;

        try {
          // eslint-disable-next-line import/no-dynamic-require, global-require
          requiredPlugin = require(requiredPluginName)(pluginOptions);
        } catch (ignoreError) {
          requiredPluginName = pluginName;

          try {
            // eslint-disable-next-line import/no-dynamic-require, global-require
            requiredPlugin = require(requiredPluginName)(pluginOptions);
          } catch (ignoreError1) {
            const pluginNameForError = pluginName.startsWith('imagemin')
              ? pluginName
              : `imagemin-${pluginName}`;

            log(
              new Error(
                `Unknown plugin: ${pluginNameForError}\n\nDid you forget to install the plugin?\nYou can install it with:\n\n$ npm install ${pluginNameForError} --save-dev\n$ yarn add ${pluginNameForError} --dev`
              ),
              metaData
            );

            return false;
          }
          // Nothing
        }

        let version = 'unknown';

        try {
          // eslint-disable-next-line import/no-dynamic-require, global-require
          ({ version } = require(`${requiredPluginName}/package.json`));
        } catch (ignoreVersion) {
          // Nothing
        }

        imageminConfig.pluginsMeta.push([
          {
            name: requiredPluginName,
            options: pluginOptions || {},
            version,
          },
        ]);

        return requiredPlugin;
      }

      log(
        new InvalidConfigError(
          `Invalid plugin configuration "${JSON.stringify(
            plugin
          )}, plugin configuraion should be 'string' or '[string, object]'"`
        ),
        metaData,
        'error'
      );

      return false;
    })
    .filter(Boolean);

  return imageminConfig;
}
