module.exports = {
    env: {
        browser: true,
        es2021: true,
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
        'jsdoc',
    ],
    rules: {
        // Rationale:
        //  - Typescript doesn't use extensions for code
        //  - Eventually we'll want to import things like images, which *will*
        //    require extensions
        'import/extensions': ['error', 'always', { pattern: { ts: 'never' } }],

        // Rationale:
        //  - Readability
        indent: ['error', 4],

        // Rationale:
        //  - JSDoc types duplicate typescript types
        'jsdoc/require-returns-type': 'off',
        'jsdoc/require-param-type': 'off',

        // Rationale:
        //  - Allow for flexibility when lining up keys and values, but not be
        //    forced to
        'no-multi-spaces': 'off',

        // Rationale:
        //  - Conflicts with convention of alphabetizing methods. This will
        //    still flag errors in problematic cases
        'no-use-before-define': [
            'error',
            {
                functions: false,
            },
        ],

        // Rationale:
        //  - This is handled by Typescript strict mode
        'no-unused-vars': 'off',

        // Rationale:
        //  - One less think to think about (Automatic Semicolon Insertion)
        semi: ['error', 'always'],
    },
};
