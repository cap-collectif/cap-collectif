const nextJest = require('next/jest')
// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: './' })

// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest-setup.tsx'],
  moduleNameMapper: {
    '^utils/(.*)$': '<rootDir>/utils/$1',
    '^components/(.*)$': '<rootDir>/components/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@relay/(.*)$': '<rootDir>/__generated__/$1',
    '^@ui/(.*)$': '<rootDir>/components/UI/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^network/(.*)$': '<rootDir>/network/$1',
    '^mutations/(.*)$': '<rootDir>/mutations/$1',
    '^styles/(.*)$': '<rootDir>/styles/$1',
    '~(.*)$': '<rootDir>/../frontend/js/$1',
  },
  testRegex: ['\\.test.ts$', '\\.test.tsx$', '\\-test.ts$', '\\-test.tsx$'],
  clearMocks: true,
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
}

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig)
