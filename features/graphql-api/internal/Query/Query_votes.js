/* eslint-env jest */

const VotesQuery = /* GraphQL */ `
  query VotesQuery {
    votes(first: 5) {
      totalCount
    }
  }
`

describe('Internal|Query.votes', () => {
  it('returns the total number of votes to an admin', async () => {
    await expect(graphql(VotesQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
