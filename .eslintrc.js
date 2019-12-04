module.exports = {
  extends: [
    'airbnb',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
    'plugin:flowtype/recommended',
    'plugin:jest/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:relay/recommended',
  ],
  parser: 'babel-eslint',
  plugins: ['flowtype', 'import', 'react', 'react-hooks', 'jsx-a11y', 'jest', 'relay', 'graphql', 'formatjs'],
  globals: {
    $: true,
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
    // Flow vars
    HTMLInputElement: true,
    Element: true,
    // Jest e2e
    graphql: true,
    toGlobalId: true,
  },
  rules: {
    'formatjs/no-camel-case': 'error',
    'formatjs/enforce-plural-rules': 'error',
    'formatjs/no-offset': 'error',
    'formatjs/no-multiple-plurals': 'error',
    'formatjs/enforce-placeholders': 'error',
    // TODO find a solution to activate this
    // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/label-has-associated-control.md#case-i-have-two-labels-for-the-same-input
    'jsx-a11y/label-has-associated-control': 'off',
    // TODO set this to error
    'prefer-promise-reject-errors': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'graphql/named-operations': [
      'error',
      {
        env: 'relay',
        tagName: 'graphql',
      },
    ],
    // TODO set this to `error`:  https://github.com/cap-collectif/platform/issues/6094
    'graphql/template-strings': [
      'warn',
      {
        env: 'relay',
        tagName: 'graphql',
      },
    ],
    'graphql/no-deprecated-fields': [
      'warn',
      {
        env: 'relay',
        tagName: 'graphql',
      },
    ],
    // https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/396
    'jsx-a11y/href-no-hash': 'off',
    // Deprecated: https://github.com/evcohen/eslint-plugin-jsx-a11y/releases/tag/v6.1.0
    'jsx-a11y/label-has-for': 'off',
    // Disabled for Flow generated props
    // Maybe we could use a different syntax
    // Such as import * as generated from …
    camelcase: 'off',
    'import/no-cycle': 'off',
    'relay/generated-flow-types': ['error', { fix: false }],
    // TODO: https://github.com/cap-collectif/platform/issues/5966
    'react/require-default-props': 'off',
    // TODO: https://github.com/cap-collectif/platform/issues/5967
    'react/no-children-prop': 'off',
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
    // We use .js instead of .jsx
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
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
    // This conflict with Prettier
    'flowtype/space-after-type-colon': 'off',
    // TODO enable this
    'no-param-reassign': 'off',
    // Maybe enable this
    'consistent-return': 'off',
    // Maybe enable this
    'array-callback-return': 'off',
    // With styled-component typed it's not viable
    'flowtype/generic-spacing': 'off',
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
    'flowtype/require-valid-file-annotation': ['error', 'always'],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['~relay', './frontend/js/__generated__/~relay'],
          ['~ui', './frontend/js/components/Ui'],
          ['~', './frontend/js/'],
        ],
      },
    },
  },
};
