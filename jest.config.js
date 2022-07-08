// @flow
module.exports = {
  rootDir: '.',
  coverageDirectory: '<rootDir>/coverage/jest',
  collectCoverageFrom: [
    '<rootDir>/frontend/js/**/*.js',
    '!<rootDir>/frontend/js/browserUpdate.js',
    '!<rootDir>/frontend/js/googleChart.js',
    '!<rootDir>/frontend/js/jsapi.js',
    // We can't use coverage on Ui files cf https://stackoverflow.com/questions/43940649/unexpected-node-type-error-sequenceexpression-with-jest
    '!<rootDir>/frontend/js/components/Ui/**/*.js',
    '!**/*.graphql.js',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif)$': '<rootDir>/__mocks__/file.js',
    '\\.svg': '<rootDir>/__mocks__/svg.js',
    '~relay(.*)$': '<rootDir>/frontend/js/__generated__/~relay/$1',
    '~ui(.*)$': '<rootDir>/frontend/js/components/Ui/$1',
    '~ds(.*)$': '<rootDir>/frontend/js/components/DesignSystem/$1',
    '~(.*)$': '<rootDir>/frontend/js/$1',
    '~svg(.*)$': '<rootDir>/public/svg/$1',
    '~image(.*)$': '<rootDir>/public/image/$1',
    '\\.(css|less)$': 'identity-obj-proxy',
    '\\.(ttf|woff|woff2)$': '<rootDir>/__mocks__/font.js',
  },
  coverageReporters: ['text', 'json-summary', 'lcov', 'clover', 'json'],
  modulePaths: ['<rootDir>/frontend/js/__generated__'],
  // TODO remove startups, only to speed up on CI
  roots: ['<rootDir>/frontend/js'],
  testEnvironment: 'jsdom',
  clearMocks: true,
  testRegex: '\\-test.js$',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  transform: {
    '.*': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(recharts)/)'],
  resolver: '<rootDir>/jest.resolver.js',
};
