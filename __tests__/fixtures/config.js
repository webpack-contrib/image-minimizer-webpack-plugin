import path from 'path';

const loader = path.resolve(__dirname, '../../loader.js');

export default {
    context: __dirname,
    entry: './loader.js',
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]'
                        }
                    },
                    {
                        loader: `${loader}`
                    }
                ]
            }
        ]
    },
    output: {
        filename: 'bundle.js'
    }
};
