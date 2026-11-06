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

/**
 * @jest-status compliant
 * @jest-reason Checks the sitemap footer-link contract explicitly and keeps the complete footer response snapshot.
 */
describe('Internal|Query footer', () => {
  it('Get Footer data', async () => {
    const response = await graphql(FooterQuery, {}, 'internal')

    const sitemapLinks = response.footer.links.filter(({ url }) =>
      new URL(url, 'http://localhost').pathname.endsWith('/sitemap'),
    )
    expect(sitemapLinks).toHaveLength(1)
    expect(sitemapLinks[0].name).toBe('Plan du site')
    expect(response).toMatchSnapshot()
  })
})
