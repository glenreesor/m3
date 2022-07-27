module.exports = {
    env: {
        browser: true,
        es2021: true,
        'jest/globals': true,
    },
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'plugin:jest/recommended',
        'plugin:jsdoc/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
    ],
    ignorePatterns: ['*.json'],
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

        'import/prefer-default-export': 'off',
            // - This rule only makes sense for components where the thing
            //   being exported is identical to the filename
            // - It doesn't make sense for something like a utility file that
            //   has a single function (or where you expect more functions to
            //   to be added later)

        'jsdoc/require-jsdoc': ['error', { publicOnly: true }],
            // The goal is to make code as self-documenting as possible, but
            // JSDoc is useful for IDE support -- showing function docs without
            // having to navigate to the file containing that function

        'jsdoc/require-returns-type': 'off',
        'jsdoc/require-param-type': 'off',
            // JSDoc types are redundant with typescript types

        'jsdoc/tag-lines': 'off',
            // Allowing blank lines is useful to make the @returns line stand
            // out more

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

        'operator-linebreak': 'off',
            // - So multi-line conditions have operators at the end of the line
            //   rather than at the beginning of the next line

        semi: ['error', 'always'],
            // - One less thing to think about (Automatic Semicolon Insertion)
    },
};
