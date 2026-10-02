/* eslint-env jest */

const PagesQuery = /* GraphQL */ `
  query PagesQuery {
    pages {
      id
      title
      frTitle: title(locale: FR_FR)
      enTitle: title(locale: EN_GB)
      translations {
        title
        body
        locale
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.pages array', () => {
  it('fetches the first hundred pages with a cursor', async () => {
    await expect(graphql(PagesQuery, { count: 100 }, 'internal')).resolves.toMatchSnapshot()
  })
})
