import tsEsLint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jest from 'jest';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import licenseHeader from 'eslint-plugin-license-header';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'], // Adjust the file patterns as needed
    languageOptions: {
      globals: {
        browser: false,
        es6: true,
        node: true,
        // Add any global variables here
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    plugins: {
      tsEsLint,
      jest,
      licenseHeader,
    },
    ignores: [
      // '__tests__/**',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'dist',
      'node_modules',
      '**/*.js',
      '**/*.d.ts',
      'tmp',
      'package*.json',
      'tsconfig*.json',
      'commitlint.config.ts',
    ],
    rules: {
      'tsEsLint/explicit-function-return-type': 'warn',
      'tsEsLint/no-var-requires': 'off',
      'licenseHeader/header': ['error', './resources/license-header.js'],
      // Add other rules here
    },
  },
  eslintPluginPrettierRecommended,
  // You can add more configuration objects if needed for different file patterns or environments
];
