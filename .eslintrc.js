module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  plugins: [
    'flowtype',
    'import',
    'react',
    'jest'
  ],
  globals: {
    $: true,
    screen: true,
    google: true,
    CKEDITOR: true,
    document: true,
    window: true,
    FormData: true,
    location: true,
    File: true,
    localStorage: true,
    fetch: true,
    Modernizr: true,
    jQuery: true,
    __SERVER__: true
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    'flowtype/boolean-style': [ 2, 'boolean'],
    'flowtype/define-flow-type': 1,
    'flowtype/delimiter-dangle': [ 2,'never'],
    'flowtype/generic-spacing': [ 2, 'never'],
    'flowtype/no-primitive-constructor-types': 2,
    'flowtype/no-weak-types': [2, {'any': false, 'Object': false }],
    'flowtype/object-type-delimiter': [2, 'comma'],
    'flowtype/require-parameter-type': 0,
    'flowtype/require-return-type': [ 0, 'always', { 'annotateUndefined': 'never'}],
    'flowtype/require-valid-file-annotation': 2,
    'flowtype/semi': [ 2, 'always'],
    'flowtype/space-after-type-colon': [ 2, 'always'],
    'flowtype/space-before-generic-bracket': [ 2, 'never'],
    'flowtype/space-before-type-colon': [ 2, 'never'],
    'flowtype/type-id-match': [ 2, '^([A-Z][a-z0-9]+)+Type$'],
    'flowtype/union-intersection-spacing': [ 2, 'always'],
    'flowtype/use-flow-type': 1,
    'flowtype/valid-syntax': 1,
    'import/no-named-as-default': 'off',
    'import/imports-first': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'react/no-find-dom-node': 'off',
    'react/no-string-refs': 'off',
    'react/jsx-closing-bracket-location': 'off',
    'react/jsx-first-prop-new-line': 'off',
    'react/self-closing-comp': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'react/jsx-indent': 'off',
    'react/jsx-indent-props': 'off',
    'react/jsx-no-bind': 'off',
    'react/prefer-stateless-function': 'off',
    'react/require-extension': 'off',
    'react/prefer-es6-class': 'off',
    'no-underscore-dangle': 'off',
    'no-confusing-arrow': 'off',
    'no-nested-ternary': 'off',
    'arrow-body-style': 'off',
    'max-len': 'off',
    'no-param-reassign': 'off',
    'consistent-return': 'off',
    'array-callback-return': 'off',
    'no-return-assign': 'off'
  },
  "settings": {
    "flowtype": {
      "onlyFilesWithFlowAnnotation": true
    }
  }
};
