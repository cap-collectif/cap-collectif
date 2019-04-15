module.exports = {
    roots: ['features/graphql-public'],
    testEnvironment: 'node',
    testRegex: '\\.js$',
    transform: {
      '.*': 'babel-jest',
    },
  setupFiles: ['<rootDir>/jest-setup.e2e.js'],
  };
  