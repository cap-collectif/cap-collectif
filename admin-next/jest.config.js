// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleNameMapper: {
    '^utils/(.*)$': '<rootDir>/utils/$1',
    '^components/(.*)$': '<rootDir>/components/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@relay/(.*)$': '<rootDir>/__generated__/$1',
    '^@ui/(.*)$': '<rootDir>/components/UI/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^network/(.*)$': '<rootDir>/network/$1',
    '^mutations/(.*)$': '<rootDir>/mutations/$1',
    '^styles/(.*)$': '<rootDir>/styles/$1',
    '~(.*)$': '<rootDir>/../frontend/js/$1',
  },
  testRegex: ['\\.test.ts$', '\\.test.tsx$'],
  clearMocks: true,
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
};

module.exports = createJestConfig(customJestConfig);
