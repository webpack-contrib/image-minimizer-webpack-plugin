'use strict';

const minimatch = require('minimatch');

module.exports = rawTestValue => {
    const tests = Array.isArray(rawTestValue) ? rawTestValue : [rawTestValue];

    return tests.map(test => {
        if (test instanceof RegExp) {
            // If it's a regex, just return it
            return test;
        } else if (typeof test === 'string') {
            // If it's a string, let minimatch convert it to a regex
            return minimatch.makeRe(test);
        }

        throw new Error(
            'test parameter must be a regex, glob string, or an array of regexes or glob strings'
        );
    });
};
