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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('returns the cookie settings as super-admin', async () => {
    await expect(graphql(CookieSettingsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('denies access as regular user', async () => {
    await expect(graphql(CookieSettingsQuery, {}, 'internal_user')).rejects.toThrowError('Access denied to this field.')
  })
})
