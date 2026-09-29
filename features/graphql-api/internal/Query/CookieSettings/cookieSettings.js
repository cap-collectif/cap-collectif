/* eslint-env jest */

const CookieSettingsQuery = /* GraphQL */ `
  query {
    cookieSettings {
      keyname
      value
      isEnabled
    }
  }
`

describe('Internal|cookieSettings', () => {
  it('returns the cookie settings as super-admin', async () => {
    await expect(graphql(CookieSettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  it('denies access as regular user', async () => {
    await expect(graphql(CookieSettingsQuery, {}, 'internal_user')).rejects.toThrowError('Access denied to this field.')
  })
})
