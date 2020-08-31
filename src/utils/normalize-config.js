import { klona } from 'klona/full';

function log(error, metaData, type = null) {
  if (metaData.result) {
    const shouldBeError = type === 'error' ? true : metaData.options.bail;

    if (shouldBeError) {
      metaData.result.errors.push(error);
    } else {
      metaData.result.warnings.push(error);
    }

    return;
  }

  throw error;
}

function normalizeConfig(minimizerOptions, metaData = {}) {
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
      } else if (typeof plugin === 'function') {
        log(
          new Error(
            "Do not use a function as plugin (i.e. '{ plugins: [imageminMozjpeg()] }'), it is not allowed invalidate a cache. It will be removed in next major release. You can rewrite this to '{ plugins: ['mozjpeg'] }' or '{ plugins: [['mozjpeg', options]] }', please see the documentation for more information."
          ),
          metaData,
          'warning'
        );
      } else {
        log(
          new Error(
            `Invalid plugin configuration "${JSON.stringify(
              plugin
            )}, plugin configuraion should be 'string' or '[string, object]'"`
          ),
          metaData
        );

        return false;
      }

      return plugin;
    })
    .filter(Boolean);

  return imageminConfig;
}

export default normalizeConfig;
