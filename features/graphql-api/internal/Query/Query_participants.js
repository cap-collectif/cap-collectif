//* eslint-env jest */
const ParticipantsQuery = /* GraphQL */ `
  query ParticipantsQuery($count: Int, $cursor: String) {
    participants(first: $count, after: $cursor) {
      totalCount
      edges {
        node {
          id
          firstname
          __typename
        }
        cursor
      }
    }
  }
`

const variables = {
  count: 16,
  cursor: null,
}

describe('Internal|Query participants', () => {
  it('fetches all participants as admin', async () => {
    await expect(graphql(ParticipantsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })
  it('fetches all participants as organization member', async () => {
    await expect(graphql(ParticipantsQuery, variables, 'internal_christophe')).resolves.toMatchSnapshot()
  })
})
