/* eslint-env jest */
const DebateArticlesQuery = /* GraphQL */ `
  query DebateArticlesQuery($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on Debate {
        articles(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
              url
              title
              description
              coverUrl
              origin
              publishedAt
              hasBeenCrawled
            }
          }
        }
      }
    }
  }
`

const DebateArticlesCountersQuery = /* GraphQL */ `
  query DebateArticlesCountersQuery($id: ID!) {
    node(id: $id) {
      ... on Debate {
        articles(first: 0) {
          totalCount
        }
      }
    }
  }
`

describe('Internal|Debate.articles connection', () => {
  const debateId = toGlobalId('Debate', 'debateCannabis')

  it('fetches 2 first articles associated to a debate with a cursor', async () => {
    await expect(
      graphql(
        DebateArticlesQuery,
        {
          count: 2,
          id: debateId,
          cursor: null,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches 1 next articles associated to a debate with a cursor', async () => {
    await expect(
      graphql(
        DebateArticlesQuery,
        {
          count: 1,
          id: debateId,
          cursor: toGlobalId('arrayconnection', '1'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches votes counters associated to a debate', async () => {
    await expect(
      graphql(
        DebateArticlesCountersQuery,
        {
          id: debateId,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
