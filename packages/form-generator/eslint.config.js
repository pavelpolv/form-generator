import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importX from 'eslint-plugin-import-x'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

export default [
  // 1. Ignored files
  { ignores: ['dist/**', 'coverage/**', '*.config.*', '.storybook/**'] },

  // 2. Base JS recommended
  js.configs.recommended,

  // 3. TypeScript recommended
  ...tseslint.configs.recommended,

  // 4. Main rules for TS/TSX source files
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import-x': importX,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // --- ESLint core ---
      'complexity': ['warn', 20],
      'indent': ['error', 2],
      'max-classes-per-file': 'off',
      'max-nested-callbacks': 'warn',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-param-reassign': 'off',
      'no-shadow': 'off',
      'no-restricted-imports': ['error', {
        name: 'lodash',
        message: "Please use single imports of lodash functions, e.g 'import isEqual from \"lodash/isEqual\"'",
      }],
      'padding-line-between-statements': ['warn',
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: 'return' },
      ],
      'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-newline': ['error', { multiline: true, consistent: true }],

      // --- @typescript-eslint ---
      '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/default-param-last': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true, variables: true }],

      // --- React ---
      'react/destructuring-assignment': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-boolean-value': ['error', 'always'],
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
      'react/jsx-fragments': ['warn', 'syntax'],
      'react/jsx-max-props-per-line': ['error', { maximum: 1 }],
      'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-uses-react': 'error',
      'react/no-array-index-key': 'off',
      'react/prefer-stateless-function': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/sort-comp': 'off',
      'react/state-in-constructor': ['error', 'never'],
      'react/static-property-placement': ['error', 'static public field'],

      // --- React Hooks ---
      'react-hooks/exhaustive-deps': 'off',

      // --- JSX A11y ---
      'jsx-a11y/anchor-is-valid': ['warn', { aspects: ['invalidHref'] }],
      'jsx-a11y/iframe-has-title': 'off',
      'jsx-a11y/label-has-associated-control': ['error', {
        labelComponents: ['label'],
        assert: 'either',
      }],

      // --- Import ---
      'import-x/extensions': 'off',
      'import-x/no-cycle': 'off',
      'import-x/no-extraneous-dependencies': ['error', {
        devDependencies: ['**/*.{stories,test,tests,spec}.{js,jsx,ts,tsx}'],
      }],
      'import-x/no-import-module-exports': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-useless-path-segments': ['error', { noUselessIndex: true }],
      'import-x/prefer-default-export': 'off',

      // --- Simple import sort ---
      'simple-import-sort/exports': 'warn',
    },
  },

  // 5. Allow devDependencies in tests/stories/setup/bench
  {
    files: [
      'src/**/*.{test,spec,stories,bench}.{ts,tsx}',
      'src/**/setup.ts',
    ],
    rules: {
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
