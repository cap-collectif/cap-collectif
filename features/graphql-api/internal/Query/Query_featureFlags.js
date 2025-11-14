/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query GetAllFeatureFlagsQuery {
    featureFlags {
      type
    }
  }
`

describe('Internal|Query.featureFlags', () => {
  it('fetches all feature flags', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
