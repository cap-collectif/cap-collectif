/* eslint-env jest */

const InternalQuery = /* GraphQL */ `
  query InternalQuery {
    allContributors {
      totalCount
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.allContributors', () => {
  it('fetches total number of contributors', async () => {
    await expect(graphql(InternalQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
