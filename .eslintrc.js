module.exports = {
    env: {
        browser: true,
        es2021: true,
        "jest/globals": true,
    },
    extends: [
        'airbnb-base',
        'plugin:import/typescript',
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

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
            // The regular no-unused-vars doesn't understand TS things like:
            // interface MyInterface {
            //     myFunction(arg: string) => void
            // }

        'import/extensions': ['error', 'always', { pattern: { ts: 'never' } }],
            // - Typescript doesn't use extensions for code
            // - Eventually we'll want to import things like images, which *will*
            //   require extensions

        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    'webpack.*.js',
                    'postcss.config.js',
                ],
            },
        ],

        'jsdoc/require-jsdoc': ['error', { publicOnly: true }],
            // The goal is to make code as self-documenting as possible, but
            // JSDoc is useful for IDE support -- showing function docs without
            // having to navigate to the file containing that function

        'jsdoc/require-returns-type': 'off',
        'jsdoc/require-param-type': 'off',
            // JSDoc types are redundant with typescript types

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
