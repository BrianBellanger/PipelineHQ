/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
  },
  overrides: [
    {
      files: ['client/src/**/*.{ts,tsx}'],
      env: { browser: true },
      plugins: ['react-hooks', 'react-refresh'],
      extends: ['plugin:react-hooks/recommended'],
      rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      },
    },
    {
      files: ['server/**/*.ts'],
      env: { node: true },
    },
    {
      files: ['shared/**/*.ts'],
      env: { node: true, browser: true },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '*.cjs',
    '*.mjs',
    'client/tailwind.config.ts',
    'client/postcss.config.js',
  ],
};
