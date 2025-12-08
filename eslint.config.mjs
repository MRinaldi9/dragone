import eslint from '@eslint/js';
import { configs as angularConfigs, processInlineTemplates } from 'angular-eslint';
import eslintConfig from 'eslint-config-prettier/flat';
import { configs as storybookEslint } from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import { configs as tsEslintConfig } from 'typescript-eslint';

export default defineConfig(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tsEslintConfig.recommended,
      ...tsEslintConfig.stylistic,
      ...angularConfigs.tsRecommended,
    ],
    processor: processInlineTemplates,
    rules: {
      '@angular-eslint/sort-lifecycle-methods': 'error',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/sort-keys-in-type-decorator': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angularConfigs.templateRecommended, ...angularConfigs.templateAccessibility],
    rules: {
      '@angular-eslint/template/conditional-complexity': 'error',
      '@angular-eslint/template/cyclomatic-complexity': 'error',
      '@angular-eslint/template/no-empty-control-flow': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/prefer-at-empty': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/prefer-template-literal': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
    },
  },
  storybookEslint['flat/recommended'],
  { ignores: ['!.storybook'] },
  eslintConfig,
);
