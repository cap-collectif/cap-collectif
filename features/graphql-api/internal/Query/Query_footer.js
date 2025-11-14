//* eslint-env jest */
const FooterQuery = /* GraphQL */ `
  query footerQuery {
    footer {
      socialNetworks {
        title
        link
        style
      }
      links {
        name
        url
      }
      legals {
        cookies
        privacy
        legal
      }
      cookiesPath
      legalPath
      title
      body
    }
  }
`

describe('Internal|Query footer', () => {
  it('Get Footer data', async () => {
    await expect(graphql(FooterQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
