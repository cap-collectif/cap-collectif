module.exports = {
    roots: ['features/graphql-api'],
    testEnvironment: 'node',
    testRegex: '\\.js$',
    transform: {
      '.*': 'babel-jest',
    },
      setupFilesAfterEnv: ['<rootDir>/jest-setup.e2e.js'],
  };
