/* eslint-env jest */
const DebateAlternateArgumentsQuery = /* GraphQL */ `
  query DebateAlternateArgumentsQuery($id: ID!, $orderBy: DebateArgumentOrder, $first: Int!, $after: String) {
    node(id: $id) {
      ... on Debate {
        alternateArguments(first: $first, after: $after, orderBy: $orderBy) {
          totalCount
          edges {
            cursor
            node {
              for {
                id
                type
                votes {
                  totalCount
                }
              }
              against {
                id
                type
                votes {
                  totalCount
                }
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|Debate.alternateArguments connection', () => {
  it('fetches alternate arguments associated to a debate without a cursor', async () => {
    await expect(
      graphql(
        DebateAlternateArgumentsQuery,
        {
          first: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          after: null,
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches alternate arguments associated to a debate with a cursor', async () => {
    await expect(
      graphql(
        DebateAlternateArgumentsQuery,
        {
          first: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          after:
            'YToyOntzOjM6ImZvciI7czo3MjoiWVRveU9udHBPakE3YVRveE5qQXpORE0yTkRBd01EQXdPMms2TVR0ek9qRTFPaUprWldKaGRHVkJjbWQxYldWdWRERWlPMzA9IjtzOjc6ImFnYWluc3QiO047fQ==',
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('sort alternate arguments associated to a debate by their number of votes', async () => {
    await expect(
      graphql(
        DebateAlternateArgumentsQuery,
        {
          first: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          after: null,
          orderBy: {
            field: 'VOTE_COUNT',
            direction: 'DESC',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
