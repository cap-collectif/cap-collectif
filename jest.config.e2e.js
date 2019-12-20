module.exports = {
    roots: ['features/graphql-api'],
    testPathIgnorePatterns : [
      "<rootDir>/features/graphql-api/internal/mutation/_setup.js"
    ],
    testEnvironment: 'node',
    testRegex: '\\.js$',
    transform: {
      '.*': 'babel-jest',
    },
      setupFilesAfterEnv: ['<rootDir>/jest-setup.e2e.js'],
  };
