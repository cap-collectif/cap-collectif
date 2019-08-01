module.exports = {
    roots: ['features/graphql-public'],
    testEnvironment: 'node',
    testRegex: '\\.js$',
    transform: {
      '.*': 'babel-jest',
    },
      setupFilesAfterEnv: ['<rootDir>/jest-setup.e2e.js'],
  };
  