/* eslint-env jest */
const DebateVotesQuery = /* GraphQL */ `
  query DebateVotesQuery($id: ID!, $count: Int!, $cursor: String, $type: ForOrAgainstValue) {
    node(id: $id) {
      ... on Debate {
        votes(first: $count, after: $cursor, type: $type) {
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
  query DebateVotesCountersQuery($id: ID!) {
    node(id: $id) {
      ... on Debate {
        allVotes: votes(first: 0) {
          totalCount
        }
        forVotes: votes(first: 0, type: FOR) {
          totalCount
        }
        againstVotes: votes(first: 0, type: AGAINST) {
          totalCount
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
          cursor: toGlobalId('arrayconnection', '4'),
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

  it('fetches votes counters associated to a debate', async () => {
    await expect(
      graphql(
        DebateVotesCountersQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
