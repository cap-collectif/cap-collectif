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
              ... on DebateArgument {
                author {
                  id
                }
              }
              ... on DebateAnonymousArgument {
                username
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
        allArguments: arguments(first: 0) {
          totalCount
        }
        forArguments: arguments(first: 0, value: FOR) {
          totalCount
        }
        againstArguments: arguments(first: 0, value: AGAINST) {
          totalCount
        }
        publishedArguments: arguments(first: 0, isPublished: true, isTrashed: false) {
          totalCount
        }
        unpublishedArguments: arguments(first: 0, isPublished: false) {
          totalCount
        }
        trashedArguments: arguments(first: 0, isTrashed: true) {
          totalCount
        }
      }
    }
  }
`;

const DebateArgumentsIPQuery = /* GraphQL */ `
  query DebateArgumentsQuery($id: ID!) {
    node(id: $id) {
      ... on Debate {
        arguments {
          edges {
            node {
              id
              ipAddress
              votes {
                edges {
                  node {
                    id
                    ipAddress
                  }
                }
              }
            }
          }
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
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches ips of arguments and argumentVotes associated to a debate', async () => {
    await expect(
      graphql(
        DebateArgumentsIPQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches ips of arguments and argumentVotes associated to a debate without rights', async () => {
    await expect(
      graphql(
        DebateArgumentsIPQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });
});
