module.exports = api => {
  api.cache(false);
  return {
    presets: ['@babel/preset-react', '@babel/preset-flow', '@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties'],
  };
};
