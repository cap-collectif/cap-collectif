module.exports = {
  roots: ['features/graphql-api'],
  testPathIgnorePatterns: ['<rootDir>/features/graphql-api/_setup.js'],
  testEnvironment: 'node',
  testMatch: ['**/*.js'],
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
    [ 'jest-junit', {
      outputDirectory: 'features/graphql-api/reports/junit',
      outputName: 'api-test-results.xml',
      addFileAttribute: "true",
    } ]
  ]
}
