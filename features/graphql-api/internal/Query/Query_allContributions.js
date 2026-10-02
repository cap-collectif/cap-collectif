/* eslint-env jest */

const AllContributionsQuery = /* GraphQL */ `
  query AllContributionsQuery {
    allContributions
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.allContributions', () => {
  it('returns the total number of contributions', async () => {
    await expect(graphql(AllContributionsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
