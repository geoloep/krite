module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: ['cypress'],
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
};
