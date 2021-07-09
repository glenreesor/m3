module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        /* eslint-disable indent */

        'import/extensions': ['error', 'always', { pattern: { ts: 'never' } }],
            // - Typescript doesn't use extensions for code
            // - Eventually we'll want to import things like images, which *will*
            //   require extensions

        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    'webpack.common.js',
                    'webpack.dev.js',
                    'webpack.prod.js',
                ],
            },
        ],

        indent: ['error', 4],

        'no-mixed-operators': 'off',
            // - This is a pain when trying to write formulas that are easily
            //   understandable

        'no-multi-spaces': 'off',
            // - Allow for flexibility when lining up keys and values, but not be
            //   forced to

        'no-use-before-define': [
            'error',
            {
                functions: false,
            },
        ],
            // - Conflicts with convention of alphabetizing methods. This will
            //   still flag errors in problematic cases

        semi: ['error', 'always'],
            // - One less thing to think about (Automatic Semicolon Insertion)
    },
};
