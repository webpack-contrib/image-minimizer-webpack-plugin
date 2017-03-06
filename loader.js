'use strict';

const loaderUtils = require('loader-utils');
const imagemin = require('imagemin');
const nodeify = require('nodeify');

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

module.exports = function (content) {
    if (typeof this.cacheable === 'function') {
        this.cacheable();
    }

    const options = Object.assign(
        {},
        {
            plugins: []
        },
        loaderUtils.getOptions(this)
    );

    if (options.plugins.length === 0) {
        throw new Error('No plugins found for imagemin');
    }

    const callback = this.async();

    // Todo Throttle and verbose
    return nodeify(
        imagemin.buffer(content, options),
        (error, optimizedContent) => callback(error, optimizedContent)
    );
};

module.exports.raw = true;
