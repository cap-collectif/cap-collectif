module.exports = api => {
  api.cache(false);
  return {
    presets: ['@babel/preset-react', '@babel/preset-flow', '@babel/preset-env'],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      'styled-components',
      // "react-docgen",
      'relay',
      [
        'react-intl',
        {
          messagesDir: './intl/react/',
        },
      ],
    ],
  };
};
