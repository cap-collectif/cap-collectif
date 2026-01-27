// Jest config for mutation tests - includes DB reset before each test
module.exports = {
  roots: ['<rootDir>/features/graphql-api', '<rootDir>/jest'],
  testPathIgnorePatterns: [
    '<rootDir>/features/graphql-api/_setupDB.js',
    '<rootDir>/features/graphql-api/_setupES.js',
    '<rootDir>/features/graphql-api/_setupFeatureFlags.js',
    '<rootDir>/features/graphql-api/_setupPublicApi.js',
  ],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/features/graphql-api/**/Mutation/**/*.js'],
  transform: {
    '.*': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.e2e.js'],
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
