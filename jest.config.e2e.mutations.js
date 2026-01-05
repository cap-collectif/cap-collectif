// Jest config for mutation tests - includes DB reset before each test
module.exports = {
  roots: ['<rootDir>/features/graphql-api', '<rootDir>/jest'],
  testPathIgnorePatterns: [
    '<rootDir>/features/graphql-api/_setup.js',
    '<rootDir>/features/graphql-api/_setupWithES.js',
    '<rootDir>/features/graphql-api/enablePublicApi.js',
  ],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/features/graphql-api/**/Mutation/**/*.js'],
  transform: {
    '.*': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.e2e.js', '<rootDir>/features/graphql-api/enablePublicApi.js'],
  globalSetup: '<rootDir>/jest-setup-global.e2e.js',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'features/graphql-api/reports/junit',
        outputName: 'api-test-mutations-results.xml',
        addFileAttribute: 'true',
      },
    ],
  ],
}
