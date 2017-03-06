'use strict';

const ImageminWebpackPlugin = require('./ImageminWebpackPlugin');

module.exports = {
    imageminLoader: require.resolve('./imagemin-loader'),
    ImageminWebpackPlugin
};
