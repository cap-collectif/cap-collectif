/* eslint-env jest */
const DebateArgumentsQuery = /* GraphQL */ `
  query DebateArgumentsQuery(
    $id: ID!
    $count: Int!
    $cursor: String
    $value: ForOrAgainstValue
    $orderBy: DebateArgumentOrder
  ) {
    node(id: $id) {
      ... on Debate {
        arguments(first: $count, after: $cursor, value: $value, orderBy: $orderBy) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              body
              author {
                id
              }
              debate {
                id
              }
              type
              votes {
                edges {
                  node {
                    id
                    createdAt
                    author {
                      id
                    }
                  }
                }
              }
              viewerHasVote
              published
              publishedAt
              trashed
              trashedStatus
              trashedAt
              trashedReason
            }
          }
        }
      }
    }
  }
`;

const DebateArgumentsCountersQuery = /* GraphQL */ `
  query DebateArgumentsCountersQuery($id: ID!) {
    node(id: $id) {
      ... on Debate {
        allArguments: votes(first: 0) {
          totalCount
        }
        forArguments: votes(first: 0, value: FOR) {
          totalCount
        }
        againstArguments: votes(first: 0, value: AGAINST) {
          totalCount
        }
      }
    }
  }
`;

describe('Internal|Debate.arguments connection', () => {
  it('fetches arguments associated to a debate with a cursor', async () => {
    await expect(
      graphql(
        DebateArgumentsQuery,
        {
          count: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          cursor: null,
          orderBy: null,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('sort arguments associated to a debate by their number of votes', async () => {
    await expect(
      graphql(
        DebateArgumentsQuery,
        {
          count: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          cursor: null,
          orderBy: {
            field: 'VOTE_COUNT',
            direction: 'DESC',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches counters associated to a debate', async () => {
    await expect(
      graphql(
        DebateArgumentsCountersQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
