// @flow
module.exports = {
  coverageDirectory: './coverage/js',
  collectCoverage: true,
  // we can't use coverage on Ui files cf https://stackoverflow.com/questions/43940649/unexpected-node-type-error-sequenceexpression-with-jest
  collectCoverageFrom: ['frontend/js/**/*.js', '!frontend/js/components/Ui/**/*.js'],
  moduleNameMapper: {
    '~relay(.*)$': '<rootDir>/frontend/js/__generated__/~relay/$1',
    '~ui(.*)$': '<rootDir>/frontend/js/components/Ui/$1',
    '~(.*)$': '<rootDir>/frontend/js/$1',
  },
  coverageReporters: ['json-summary', 'lcov'],
  modulePaths: ['./frontend/js/__generated__'],
  roots: ['frontend/js'],
  testEnvironment: 'jsdom',
  clearMocks: true,
  testRegex: '\\-test.js$',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  transform: {
    '.*': 'babel-jest',
  },
};
