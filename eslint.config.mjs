import { configs as angularConfigs, processInlineTemplates } from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import { configs as tsEslintConfig } from 'typescript-eslint';

export default defineConfig(
  {
    extends: [...tsEslintConfig.recommended],
    files: ['**/*.ts'],
    processor: processInlineTemplates,
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    },
  },
  {
    extends: [...angularConfigs.templateRecommended, ...angularConfigs.templateAccessibility],
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/conditional-complexity': 'error',
      '@angular-eslint/template/cyclomatic-complexity': 'error',
      '@angular-eslint/template/no-empty-control-flow': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/prefer-at-empty': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
      '@angular-eslint/template/prefer-template-literal': 'error',
    },
  },
  { ignores: ['!.storybook', 'coverage/**', 'node_modules/**', 'dist/**'] },
);
