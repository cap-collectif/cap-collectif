/* eslint-env jest */

const LoginSettingsQuery = /* GraphQL */ `
  query {
    loginSettings {
      keyname
      value
      isEnabled
    }
  }
`

describe('Internal|loginSettings', () => {
  it('returns the login settings as super-admin', async () => {
    await expect(graphql(LoginSettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  it('denies access as regular user', async () => {
    await expect(graphql(LoginSettingsQuery, {}, 'internal_user')).rejects.toThrowError('Access denied to this field.')
  })
})
