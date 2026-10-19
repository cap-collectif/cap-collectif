// Agent integration check for Jest flag isolation; uses the running test API and Redis.
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const root = path.resolve(__dirname, '../..')
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'capco-jest-flags-'))
const resultFile = path.join(directory, 'results.json')
const query = `
  const flags = async () => {
    const response = await graphql('{ featureFlags { type enabled } }', {}, 'internal')
    return Object.fromEntries(response.featureFlags.map(flag => [flag.type, flag.enabled]))
  }
  const expectPreset = async () => {
    expect(await flags()).toMatchObject({ calendar: true, shield_mode: false })
  }
`

try {
  fs.writeFileSync(
    path.join(directory, 'failure.test.js'),
    `${query}
    beforeAll(async () => {
      await global.resetFeatureFlags({ calendar: false, shield_mode: true })
    })
    it('starts from the preset despite dirty suite setup and applies combined overrides', async () => {
      await expectPreset()
      await global.resetFeatureFlags({ calendar: false, shield_mode: true })
      expect(await flags()).toMatchObject({ calendar: false, shield_mode: true })
    })
    it('deliberately fails after changing Redis flags', async () => {
      await expectPreset()
      await global.resetFeatureFlags({ calendar: false, shield_mode: true })
      throw new Error('INTENTIONAL_FEATURE_FLAG_FAILURE')
    })
    afterAll(async () => {
      await expectPreset()
    })
  `,
  )
  fs.writeFileSync(
    path.join(directory, 'retry.test.js'),
    `${query}
    // The retry is the behavior under test, rather than a workaround for a flaky test.
    jest.retryTimes(1)
    let attempts = 0
    it('restores the preset before a Jest retry', async () => {
      attempts += 1
      await expectPreset()
      if (attempts === 1) {
        await global.resetFeatureFlags({ calendar: false, shield_mode: true })
        throw new Error('INTENTIONAL_FEATURE_FLAG_RETRY')
      }
      expect(attempts).toBe(2)
    })
    afterAll(async () => {
      expect(attempts).toBe(2)
      await expectPreset()
    })
  `,
  )

  const result = spawnSync(
    process.execPath,
    [
      path.join(root, 'node_modules/jest/bin/jest.js'),
      '--config',
      JSON.stringify({
        rootDir: root,
        roots: [directory],
        testMatch: ['**/*.test.js'],
        testEnvironment: 'node',
        transform: {},
        setupFilesAfterEnv: [path.join(root, 'jest-setup.e2e.js')],
      }),
      '--runInBand',
      '--json',
      '--outputFile',
      resultFile,
    ],
    { cwd: root, encoding: 'utf8', env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' } },
  )
  const report = JSON.parse(fs.readFileSync(resultFile, 'utf8'))
  const failures = report.testResults.flatMap(suite => suite.assertionResults.filter(test => test.status === 'failed'))
  assert.equal(result.status, 1, result.stderr)
  assert.equal(report.numPassedTests, 2, result.stderr)
  assert.equal(report.numFailedTests, 1, result.stderr)
  assert.equal(report.numRuntimeErrorTestSuites, 0, result.stderr)
  assert.equal(failures.length, 1, result.stderr)
  assert.match(failures[0].failureMessages.join('\n'), /INTENTIONAL_FEATURE_FLAG_FAILURE/)
  console.log('Jest feature flags: preset, combined overrides, failure cleanup and retry checks passed.')
} finally {
  fs.rmSync(directory, { recursive: true, force: true })
  const environment = process.env.CI ? 'ci' : 'local'
  const cleanup = spawnSync('castor', [`${environment}:qa:reset-feature-flags`], { cwd: root, encoding: 'utf8' })
  assert.equal(cleanup.status, 0, cleanup.stderr)
}
