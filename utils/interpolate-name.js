'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

module.exports = (name, template, options) => {
    let resourcePath = name;

    // A hack so .dotted files don't get parsed as extensions
    const basename = path.basename(resourcePath);
    let dotRemoved = false;

    if (basename[0] === '.') {
        dotRemoved = true;
        resourcePath = path.join(path.dirname(resourcePath), basename.slice(1));
    }

    let pathSepAdded = false;

    // A hack because loaderUtils.interpolateName doesn't
    // find the right path if no directory is defined
    // ie. [path] applied to 'file.txt' would return 'file'
    if (resourcePath.indexOf(path.sep) < 0) {
        resourcePath = path.sep + resourcePath;

        pathSepAdded = true;
    }

    let interpolateName = loaderUtils.interpolateName(
        {
            resourcePath
        },
        template,
        options
    );

    // Add back removed dots
    if (dotRemoved) {
        const newBasename = path.basename(interpolateName);

        interpolateName = `.${newBasename}`;
    }

    // Remove extra path separation
    if (pathSepAdded && /\[path\]/.test(template)) {
        interpolateName = interpolateName.slice(2);
    }

    return interpolateName;
};
