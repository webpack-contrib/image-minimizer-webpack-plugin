'use strict';

const loaderUtils = require('loader-utils');
const imagemin = require('imagemin');
const nodeify = require('nodeify');

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = function(content) {
    const options = Object.assign(
        {},
        {
            /* eslint-disable no-underscore-dangle */
            bail:
                (this._compiler &&
                    this._compiler.options &&
                    this._compiler.options.bail) ||
                    false,
            /* eslint-enable no-underscore-dangle */
            plugins: []
        },
        loaderUtils.getOptions(this) || {}
    );

    if (options.plugins.length === 0) {
        throw new Error('No plugins found for imagemin');
    }

    const callback = this.async();

    return nodeify(
        imagemin.buffer(content, options),
        (error, optimizedContent) => {
            const handledContent = error ? content : optimizedContent;

            return callback(options.bail ? error : null, handledContent);
        }
    );
};

module.exports.raw = true;
