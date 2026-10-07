/* eslint-env jest */

const PrivacySettingsQuery = /* GraphQL */ `
  query {
    privacySettings {
      keyname
      type
      isTranslatable
      isEnabled
    }
  }
`

describe('Internal|privacySettings', () => {
  it('returns the privacy settings as super-admin', async () => {
    await expect(graphql(PrivacySettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  it('denies access as regular user', async () => {
    await expect(graphql(PrivacySettingsQuery, {}, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
