module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['import'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': ['warn', {allow: ['warn', 'error']}],
    'import/no-duplicates': 'error',
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {prefer: 'type-imports', fixStyle: 'separate-type-imports'},
        ],
      },
    },
    {
      files: ['**/__tests__/**', '**/__mocks__/**', 'jest.setup.js'],
      env: {
        jest: true,
      },
    },
    {
      files: ['**/screens/**/*.tsx', '**/navigation/**/*.tsx'],
      rules: {
        'react/no-unstable-nested-components': ['warn', {allowAsProps: true}],
      },
    },
  ],
};
