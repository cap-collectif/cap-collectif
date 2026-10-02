/* eslint-env jest */

const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    votes {
      totalCount
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.votes', () => {
  it('fetches total number of votes', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
