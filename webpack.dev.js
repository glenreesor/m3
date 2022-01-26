const { merge } = require('webpack-merge');
const sass = require('sass');
const common = require('./webpack.common.js');

module.exports = merge(
    common,
    {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            host: '0.0.0.0',
        },
        module: {
            rules: [
                // All global styles live in global.scss. Let these cascade.
                {
                    test: /global\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: sass,
                            },
                        },
                    ],
                },
                // Load the rest of the styles as (s)css modules.
                {
                    test: /\.scss$/,
                    exclude: [/node_modules/, /global\.scss$/],
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                modules: true,
                                importLoaders: 1,
                                localIdentName: '[name]__[local]___[hash:base64:5]',
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: sass,
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        'file-loader',
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                disable: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.woff(2)?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'fonts/',
                            },
                        },
                    ],
                },
            ],
        },
    },
);
