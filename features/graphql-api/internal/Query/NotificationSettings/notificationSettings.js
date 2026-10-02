/* eslint-env jest */

const NotificationSettingsQuery = /* GraphQL */ `
  query {
    notificationSettings {
      keyname
      value
      isEnabled
    }
  }
`

describe('Internal|notificationSettings', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('returns the notification settings as super-admin', async () => {
    await expect(graphql(NotificationSettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('denies access as regular user', async () => {
    await expect(graphql(NotificationSettingsQuery, {}, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
