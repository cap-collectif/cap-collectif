/* eslint-env jest */
import '../../../_setupDB'

const NotificationSettingsQuery = /* GraphQL */ `
  query {
    notificationSettings {
      id
      keyname
    }
  }
`

const UpdateNotificationSettingMutation = /* GraphQL */ `
  mutation ($input: UpdateNotificationSettingInput!) {
    updateNotificationSetting(input: $input) {
      errorCode
      siteParameter {
        keyname
        value
        isEnabled
      }
    }
  }
`

const getNotificationSettingId = async () => {
  const data = await graphql(NotificationSettingsQuery, {}, 'internal_super_admin')
  return data.notificationSettings.find(param => 'admin.mail.notifications.receive_address' === param.keyname).id
}

describe('Internal|updateNotificationSetting', () => {
  it('updates the value and isEnabled as super-admin', async () => {
    const id = await getNotificationSettingId()

    await expect(
      graphql(
        UpdateNotificationSettingMutation,
        { input: { id, value: 'notifications@example.com', isEnabled: false } },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('denies the mutation as regular user', async () => {
    const id = await getNotificationSettingId()

    await expect(
      graphql(UpdateNotificationSettingMutation, { input: { id, value: 'notifications@example.com', isEnabled: false } }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('returns INVALID_VALUE for an invalid email', async () => {
    const id = await getNotificationSettingId()

    await expect(
      graphql(UpdateNotificationSettingMutation, { input: { id, value: 'invalid', isEnabled: true } }, 'internal_super_admin'),
    ).resolves.toMatchSnapshot()
  })
})
