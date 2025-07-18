import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          ignoredDependencies: [
            'tailwindcss',
            'vite',
            '@analogjs/vitest-angular',
            '@analogjs/vite-plugin-angular',
            '@nx/vite',
            '@angular/compiler',
            '@angular/platform-browser',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/component-max-inline-declarations': [
        'error',
        { template: 10, styles: 10 },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/sort-keys-in-type-decorator': 'error',
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {
      '@angular-eslint/template/conditional-complexity': 'error',
      '@angular-eslint/template/cyclomatic-complexity': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/prefer-at-empty': 'error',
      '@angular-eslint/template/prefer-contextual-for-variables': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
    },
  },
];
