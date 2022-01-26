const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const sass = require('sass');
const common = require('./webpack.common.js');

const sassLoaderConfig = {
    loader: 'sass-loader',
    options: {
        implementation: sass,
    },
};

module.exports = merge(
    common,
    {
        mode: 'production',
        module: {
            rules: [
                // All global styles live in global.scss. Let these cascade.
                {
                    test: /global\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        sassLoaderConfig,
                    ],
                },
                // Load the rest of the styles as (s)css modules.
                {
                    test: /\.scss$/,
                    exclude: [/node_modules/, /global\.scss$/],
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                importLoaders: 1,
                                // Just use className hashes in production to
                                // shorten/obfuscate classNames
                                localIdentName: '[hash:base64:5]',
                            },
                        },
                        'postcss-loader',
                        sassLoaderConfig,
                    ],
                },
                // Use url-loader instead of file-loader in production for
                // assets to inline wherever possible (for performance, though
                // not as debug-friendly).
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        'url-loader',
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
                            loader: 'url-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'fonts/',
                            },
                        },
                    ],
                },
            ],
        },
        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
            ],
        },
        plugins: [
            // Extracts and merges SCSS modules with other (global) SCSS into a
            // single CSS output file.
            new MiniCssExtractPlugin(),
        ],
    },
);
