/**
 * @jest-status reference
 * @jest-reason Verifies that the request hostname selects the Symfony environment used by Cypress.
 */
describe('getEnv', () => {
  it('uses the test environment for the Cypress hostname', async () => {
    const { getEnv } = await import('./config')

    expect(getEnv('capco.test')).toBe('test')
    expect(getEnv('capco.test:443')).toBe('test')
  })

  it('uses the development environment for the local hostname', async () => {
    const { getEnv } = await import('./config')

    expect(getEnv('capco.dev')).toBe('dev')
  })
})
