/* eslint-env jest */
import '../../../_setupES'

const DebateArgumentVotesQuery = /* GraphQL */ `
  query DebateArgumentVotesQuery($debateArgumentId: ID!) {
    debateArgument: node(id: $debateArgumentId) {
      id
      ... on DebateArgument {
        votes {
          totalCount
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

describe('Internal|DebateArgument.votes', () => {
  it('lists votes for a debate argument', async () => {
    await expect(
      graphql(
        DebateArgumentVotesQuery,
        { debateArgumentId: toGlobalId('DebateArgument', 'debateArgument2') },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
