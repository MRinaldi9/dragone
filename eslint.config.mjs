import { configs as angularConfigs, processInlineTemplates } from 'angular-eslint';
import eslintConfig from 'eslint-config-prettier/flat';
import oxlint from 'eslint-plugin-oxlint';
import { configs as storybookEslint } from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import { configs as tsEslintConfig } from 'typescript-eslint';

export default defineConfig(
  {
    files: ['**/*.ts'],
    extends: [...tsEslintConfig.recommended],
    processor: processInlineTemplates,
    rules: {},
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
  { ignores: ['!.storybook', 'coverage/**', 'node_modules/**', 'dist/**'] },
  storybookEslint['flat/recommended'],
  eslintConfig,
  oxlint.configs['flat/recommended'],
);
