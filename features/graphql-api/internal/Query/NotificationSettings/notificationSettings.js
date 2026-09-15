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
  it('returns the notification settings as super-admin', async () => {
    await expect(graphql(NotificationSettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  it('denies access as regular user', async () => {
    await expect(graphql(NotificationSettingsQuery, {}, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
