/* eslint-env jest */
const DebateVotesQuery = /* GraphQL */ `
  query DebateVotesQuery(
    $id: ID!
    $count: Int!
    $cursor: String
    $type: ForOrAgainstValue
    $isPublished: Boolean
  ) {
    node(id: $id) {
      ... on Debate {
        votes(first: $count, after: $cursor, type: $type, isPublished: $isPublished) {
          totalCount
          pageInfo {
            hasPreviousPage
            hasNextPage
            endCursor
            startCursor
          }
          edges {
            cursor
            node {
              id
              type
              createdAt
              publishedAt
              published
              debate {
                id
              }
              author {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const DebateVotesCountersQuery = /* GraphQL */ `
  query DebateVotesCountersQuery($id: ID!, $isPublished: Boolean) {
    node(id: $id) {
      ... on Debate {
        allVotes: votes(first: 0, isPublished: $isPublished) {
          totalCount
        }
        forVotes: votes(first: 0, type: FOR, isPublished: $isPublished) {
          totalCount
        }
        againstVotes: votes(first: 0, type: AGAINST, isPublished: $isPublished) {
          totalCount
        }
      }
    }
  }
`;

const DebateVoteIPQuery = /* GraphQL */ `
  query DebateVoteIPQuery($id: ID!) {
    node(id: $id) {
      ... on Debate {
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
`;

describe('Internal|Debate.Votes connection', () => {
  it('fetches 5 first votes associated to a debate with a cursor', async () => {
    await expect(
      graphql(
        DebateVotesQuery,
        {
          count: 5,
          id: toGlobalId('Debate', 'debateCannabis'),
          cursor: null,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches 5 next votes associated to a debate with a cursor', async () => {
    await expect(
      graphql(
        DebateVotesQuery,
        {
          count: 5,
          id: toGlobalId('Debate', 'debateCannabis'),
          cursor: 'YToyOntpOjA7aTotOTIyMzM3MjAzNjg1NDc3NTgwODtpOjE7czo1OiIxMzAwNCI7fQ==',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches votes associated to a debate and a FOR type with a cursor', async () => {
    await expect(
      graphql(
        DebateVotesQuery,
        {
          count: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          type: 'FOR',
          cursor: null,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches votes associated to a debate and an AGAINST type with a cursor', async () => {
    await expect(
      graphql(
        DebateVotesQuery,
        {
          count: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          type: 'AGAINST',
          cursor: null,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should not fetch unpublished only votes associated to a debate when client is not an admin', async () => {
    const response = await graphql(
      DebateVotesQuery,
      {
        count: 100,
        id: toGlobalId('Debate', 'debateCannabis'),
        isPublished: false,
      },
      'internal',
    );
    const votes = response.node.votes.edges.map(edge => edge.node);
    expect(votes.every(v => v.published === true)).toBe(true);
  });

  it('should fetch unpublished only votes associated to a debate when client is an admin', async () => {
    const response = await graphql(
      DebateVotesQuery,
      {
        count: 100,
        id: toGlobalId('Debate', 'debateCannabis'),
        isPublished: false,
      },
      'internal_admin',
    );
    const votes = response.node.votes.edges.map(edge => edge.node);
    expect(votes.every(v => v.published === false)).toBe(true);
  });

  it('fetches all votes counters associated to a debate when client is an admin', async () => {
    await expect(
      graphql(
        DebateVotesCountersQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
          isPublished: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches published votes counters associated to a debate', async () => {
    await expect(
      graphql(
        DebateVotesCountersQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
          isPublished: true,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches unpublished votes counters associated to a debate when client is an admin', async () => {
    await expect(
      graphql(
        DebateVotesCountersQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
          isPublished: false,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches votes ip associated to a debate without rights', async () => {
    await expect(
      graphql(
        DebateVoteIPQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
          cursor: null,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches votes ip associated to a debate', async () => {
    await expect(
      graphql(
        DebateVoteIPQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
          cursor: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
