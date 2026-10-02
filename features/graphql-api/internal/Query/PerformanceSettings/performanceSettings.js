/* eslint-env jest */

const PerformanceSettingsQuery = /* GraphQL */ `
  query {
    performanceSettings {
      keyname
      value
      isEnabled
    }
  }
`

describe('Internal|performanceSettings', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('returns the performance settings as super-admin', async () => {
    await expect(graphql(PerformanceSettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('denies access as admin', async () => {
    await expect(graphql(PerformanceSettingsQuery, {}, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('denies access as regular user', async () => {
    await expect(graphql(PerformanceSettingsQuery, {}, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
