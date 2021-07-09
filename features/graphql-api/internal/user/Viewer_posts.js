/* eslint-env jest */
const ViewerPostsQuery = /* GraphQL */ `
  query ViewerPostsQuery($affiliations: [PostAffiliation!]) {
    viewer {
      posts(affiliations: $affiliations) {
        totalCount
        edges {
          node {
            owner {
              username
            }
          }
        }
      }
    }
  }
`;

describe('Internal.viewer.posts', () => {
  it('should correctly fetch posts that a user owns when given the `OWNER` affiliations', async () => {
    const response = await graphql(
      ViewerPostsQuery,
      {
        affiliations: ['OWNER'],
      },
      'internal_theo',
    );

    expect(response.viewer.posts.totalCount).toBe(1);
    expect(response.viewer.posts.edges).toHaveLength(1);
    expect(response.viewer.posts.edges[0].node.owner.username).toBe('Théo QP');
  });

  it('should fetch posts where the user is among the authors when no affiliations given', async () => {
    let response = await graphql(
      ViewerPostsQuery,
      {
        affiliations: [],
      },
      'internal_theo',
    );

    expect(response.viewer.posts.totalCount).toBe(1);
    expect(response.viewer.posts.edges).toHaveLength(1);
    expect(response.viewer.posts.edges[0].node.owner.username).toBe('Théo QP');
  });
});
