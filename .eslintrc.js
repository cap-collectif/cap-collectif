module.exports = {
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },
  },
  extends: ['prettier', 'plugin:jest/recommended', 'plugin:relay/recommended'],
  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
  },
  plugins: ['import', 'react', 'react-hooks', 'jest', 'relay', '@graphql-eslint', 'formatjs', '@typescript-eslint'],
  globals: {
    $: true,
    FontFace: true,
    screen: true,
    google: true,
    CKEDITOR: true,
    document: true,
    window: true,
    FormData: true,
    location: true,
    URLSearchParams: true,
    File: true,
    localStorage: true,
    fetch: true,
    Modernizr: true,
    jQuery: true,
    __SERVER__: true,
    ReactIntlLocaleData: true,
    Cookies: true,
    // Jest e2e
    graphql: true,
    toGlobalId: true,
  },
  rules: {
    'relay/unused-fields': 'off',
    'relay/generated-flow-types': 'off',
    'no-unused-vars': 'off',
    'import/no-unresolved': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'no-console': ['warn', { allow: ['error'] }],
    'no-empty': 'error',
    'no-eval': 'error',
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'no-restricted-globals': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        '': 'never',
      },
    ],
    'react/destructuring-assignment': 'off',
    // TODO
    'react/no-unescaped-entities': 'warn',
    'react/no-this-in-sfc': 'warn',
    'react/sort-comp': 'warn',

    'formatjs/no-camel-case': 'error',
    'formatjs/enforce-plural-rules': 'error',
    'formatjs/no-offset': 'error',
    'formatjs/no-multiple-plurals': 'error',
    'formatjs/enforce-placeholders': 'error',
    // TODO set this to error
    'prefer-promise-reject-errors': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'import/no-cycle': 'off',
    // TODO: https://github.com/cap-collectif/platform/issues/5966
    'react/require-default-props': 'off',
    // No passing children as props
    'react/no-children-prop': 'error',
    // TODO: There is a problem around props-types (source: https://stackoverflow.com/a/38685130)
    'react/prop-types': 'off',
    // TODO enable this
    'react/default-props-match-prop-types': 'off',
    'react/no-unused-prop-types': 'off',
    'react/no-array-index-key': 'off',
    // TODO enable this
    'no-plusplus': 'off',
    // We must render some HTML from WYSIWYG
    'react/no-danger': 'off',
    // TODO enable this
    'class-methods-use-this': 'off',
    // TODO enable this
    'no-restricted-syntax': 'off',
    // TODO enable this
    'import/no-named-as-default': 'off',
    // TODO enable this
    'import/prefer-default-export': 'off',
    // We have a usecase for findDOMNode
    'react/no-find-dom-node': 'off',
    // TODO turn this into an error to prepare for React 17
    'react/no-string-refs': 'warn',
    // TODO enable this
    'react/jsx-no-bind': 'off',
    // TODO enable this
    'react/prefer-stateless-function': 'off',
    // TODO enable this, maybe not possible because of
    // GraphQL __typename
    'no-underscore-dangle': 'off',
    'no-nested-ternary': 'off',
    // This conflict with `style` props of `<FormattedNumber />`
    'react/style-prop-object': 'off',
    // TODO enable this
    'no-param-reassign': 'off',
    // Maybe enable this
    'consistent-return': 'off',
    // Maybe enable this
    'array-callback-return': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-bootstrap',
            importNames: ['ListGroup'],
            message: 'Please use ListGroup from "/Ui/List/ListGroup" instead.',
          },
        ],
      },
    ],
    // No large Snapshots
    'jest/no-large-snapshots': 'warn',
  },
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      processor: '@graphql-eslint/graphql',
    },
    {
      files: ['*.graphql', '**/*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      rules: {
        '@graphql-eslint/no-anonymous-operations': 'error',
        '@graphql-eslint/executable-definitions': 'warn',
        '@graphql-eslint/fields-on-correct-type': 'warn',
        '@graphql-eslint/fragments-on-composite-type': 'warn',
        '@graphql-eslint/known-argument-names': 'warn',
        '@graphql-eslint/known-type-names': 'warn',
        '@graphql-eslint/no-deprecated': 'warn',
        '@graphql-eslint/no-duplicate-fields': 'warn',
        '@graphql-eslint/no-fragment-cycles': 'warn',
        '@graphql-eslint/one-field-subscriptions': 'warn',
        '@graphql-eslint/overlapping-fields-can-be-merged': 'warn',
        '@graphql-eslint/possible-fragment-spread': 'warn',
        '@graphql-eslint/unique-argument-names': 'warn',
        '@graphql-eslint/unique-directive-names-per-location': 'warn',
        '@graphql-eslint/unique-input-field-names': 'warn',
        '@graphql-eslint/unique-variable-names': 'warn',
        '@graphql-eslint/value-literals-of-correct-type': 'warn',
        '@graphql-eslint/variables-are-input-types': 'warn',
        '@graphql-eslint/variables-in-allowed-position': 'warn',
      },
    },
  ],
}
