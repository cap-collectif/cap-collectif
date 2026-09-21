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
  it('returns the performance settings as super-admin', async () => {
    await expect(graphql(PerformanceSettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  it('denies access as admin', async () => {
    await expect(graphql(PerformanceSettingsQuery, {}, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  it('denies access as regular user', async () => {
    await expect(graphql(PerformanceSettingsQuery, {}, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
