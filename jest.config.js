module.exports = {
  rootDir: '.',
  coverageDirectory: '<rootDir>/coverage/jest',
  collectCoverageFrom: [
    '<rootDir>/frontend/js/**/*.ts',
    '<rootDir>/frontend/js/**/*.tsx',
    '!<rootDir>/frontend/js/browserUpdate.ts',
    '!<rootDir>/frontend/js/googleChart.ts',
    '!<rootDir>/frontend/js/jsapi.ts',
    // We can't use coverage on Ui files cf https://stackoverflow.com/questions/43940649/unexpected-node-type-error-sequenceexpression-with-jest
    '!<rootDir>/frontend/js/components/Ui/**/*.ts',
    '!**/*.graphql.ts',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif)$': '<rootDir>/__mocks__/file.js',
    '\\.svg': '<rootDir>/__mocks__/svg.js',
    '~relay/(.*)$': '<rootDir>/frontend/js/__generated__/~relay/$1',
    '@relay/(.*)$': '<rootDir>/frontend/js/__generated__/~relay/$1',
    '~ui(.*)$': '<rootDir>/frontend/js/components/Ui/$1',
    '~ds(.*)$': '<rootDir>/frontend/js/components/DesignSystem/$1',
    '@shared(.*)$': '<rootDir>/admin-next/shared/$1',
    '~(.*)$': '<rootDir>/frontend/js/$1',
    '~svg(.*)$': '<rootDir>/public/svg/$1',
    '~image(.*)$': '<rootDir>/public/image/$1',
    '\\.(css|less)$': 'identity-obj-proxy',
    '\\.(ttf|woff|woff2)$': '<rootDir>/__mocks__/font.js',
  },
  coverageReporters: ['text', 'json-summary', 'lcov', 'clover', 'json'],
  modulePaths: ['<rootDir>/frontend/js/__generated__'],
  // TODO remove startups, only to speed up on CI
  roots: ['<rootDir>/frontend/'],
  testEnvironment: 'jsdom',
  clearMocks: true,
  testRegex: ['\\-test.ts$', '\\-test.tsx$'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.tsx'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(recharts)/)'],
  resolver: '<rootDir>/jest.resolver.js',
  globals: {
    jest: {
      diagnostics: false,
      tsconfig: 'tsconfig.json',
      babelConfig: true,
    },
  },
}
