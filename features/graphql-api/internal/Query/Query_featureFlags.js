/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query GetAllFeatureFlagsQuery {
    featureFlags {
      type
    }
  }
`

/**
 * @jest-status compliant
 * @jest-reason Verifies the new flag is queryable through the real API and snapshots the complete flag list.
 */
describe('Internal|Query.featureFlags', () => {
  it('fetches all feature flags', async () => {
    const result = await graphql(InternalQuery, {}, 'internal')
    expect(result.featureFlags).toContainEqual({ type: 'private_media_read_enforcement' })
    expect(result).toMatchSnapshot()
  })
})
