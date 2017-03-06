import RawSource from 'webpack-sources/lib/RawSource';
import fs from 'fs';
import nodeify from 'nodeify';
import path from 'path';
import pify from 'pify';

export default class EmitWepbackPlugin {
    constructor(options = {}) {
        this.options = Object.assign({}, {
            filename: 'emit-test.jpg'
        }, options);
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, callback) => {
            const { filename } = this.options;
            const filePath = path.join(__dirname, filename);

            return nodeify(
                pify(fs.readFile)(filePath)
                    .then((data) => {
                        compilation.assets[filename] = new RawSource(data);

                        return data;
                    }),
                callback
            );
        });
    }
}
