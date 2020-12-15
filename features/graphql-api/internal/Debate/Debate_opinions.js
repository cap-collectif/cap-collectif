/* eslint-env jest */
const DebateOpinionsQuery = /* GraphQL */ `
  query DebateOpinionsQuery($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on Debate {
        opinions(first: $count, after: $cursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              title
              body
              type
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

describe('Internal|Debate.opinions connection', () => {
  it('fetches opinions associated to a debate with a cursor', async () => {
    await expect(
      graphql(
        DebateOpinionsQuery,
        {
          count: 100,
          id: toGlobalId('Debate', 'debateCannabis'),
          cursor: null,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
});
