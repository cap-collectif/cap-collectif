/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query GetAllFeatureFlagsQuery {
    featureFlags {
      type
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.featureFlags', () => {
  it('fetches all feature flags', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
