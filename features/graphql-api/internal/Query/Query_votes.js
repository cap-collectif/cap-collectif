/* eslint-env jest */

const VotesQuery = /* GraphQL */ `
  query VotesQuery {
    votes(first: 5) {
      totalCount
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.votes', () => {
  it('returns the total number of votes to an admin', async () => {
    await expect(graphql(VotesQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
