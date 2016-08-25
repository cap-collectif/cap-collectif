module.exports = {
  extends: 'airbnb',
  plugins: [
    'import',
    'react',
    'mocha'
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
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    'import/no-named-as-default': 'off',
    'import/imports-first': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'react/no-find-dom-node': 'off',
    'react/no-string-refs': 'off',
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
  }
};
