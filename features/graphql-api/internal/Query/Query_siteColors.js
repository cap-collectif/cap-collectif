/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query GetAllSiteColorsQuery {
    siteColors {
      keyname
      value
    }
  }
`

describe('Internal|Query.siteColors', () => {
  it('fetches all site colors.', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
