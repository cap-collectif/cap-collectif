module.exports = {
  coverageDirectory: './coverage/js',
  collectCoverage: true,
  coverageReporters: ['json-summary', 'lcov'],
  roots: ['app/Resources/js'],
  testEnvironment: 'jsdom',
  testRegex: '\\-test.js$',
  setupFiles: ['<rootDir>/jest-setup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  transform: {
    '.*': 'babel-jest',
  },
};
