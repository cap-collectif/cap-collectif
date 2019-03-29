module.exports = {
  coverageDirectory: './coverage/js',
  collectCoverage: true,
  // we can't use coverage on Ui files cf https://stackoverflow.com/questions/43940649/unexpected-node-type-error-sequenceexpression-with-jest
  collectCoverageFrom: [
    "app/Resources/js/**/*.js",
    "!app/Resources/js/components/Ui/**/*.js"
  ],
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
