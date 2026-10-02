/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query GetAllSiteColorsQuery {
    siteColors {
      keyname
      value
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.siteColors', () => {
  it('fetches all site colors.', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
