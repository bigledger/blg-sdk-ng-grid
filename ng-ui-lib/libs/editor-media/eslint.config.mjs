import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import { join } from 'node:path';

const gitignorePath = join(import.meta.dirname, '../../.gitignore');

export default [
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.ts'],
    processor: angular.processInlineTemplates,
  },
  ...angular.configs.tsRecommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    files: ['**/*.html'],
    ...angular.configs.templateRecommended,
  },
];