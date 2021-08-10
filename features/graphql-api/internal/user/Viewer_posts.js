/* eslint-env jest */

const ViewerPostsQuery = /* GraphQL */ `
  query ViewerPostsQuery($affiliations: [PostAffiliation!]) {
    viewer {
      posts(affiliations: $affiliations) {
        totalCount
        edges {
          node {
            id
            title
            owner {
              username
            }
          }
        }
      }
    }
  }
`;

const ViewerPostsQueryFilterByQuery = /* GraphQL */ `
  query ViewerPostsQuery($query: String) {
    viewer {
      posts(query: $query) {
        totalCount
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`;

const ViewerPostsQueryOrderBy = /* GraphQL */ `
  query ViewerPostsQuery($orderBy: PostOrder) {
    viewer {
      posts(orderBy: $orderBy) {
        totalCount
        edges {
          node {
            id
            title
            updatedAt
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

    expect(response.viewer.posts.totalCount).toBe(2);
    expect(response.viewer.posts.edges).toHaveLength(2);
    expect(response.viewer.posts.edges[0].node.owner.username).toBe('Théo QP');
    expect(response.viewer.posts.edges[1].node.owner.username).toBe('Théo QP');
  });

  it('should correctly fetch all posts when affiliations is null.', async () => {
    const response = await graphql(
      ViewerPostsQuery,
      {
        affiliations: null,
      },
      'internal_theo',
    );

    expect(response.viewer.posts.totalCount).toBe(22);
    expect(response.viewer.posts.edges).toHaveLength(22);
  });

  it('should correctly fetch posts filtered by a given query', async () => {
    const response = await graphql(
      ViewerPostsQueryFilterByQuery,
      {
        query: 'deuxieme',
      },
      'internal_theo',
    );

    expect(response.viewer.posts.totalCount).toBe(1);
    expect(response.viewer.posts.edges).toHaveLength(1);
    expect(response.viewer.posts.edges[0].node.id).toBe('UG9zdDpwb3N0V2l0aE93bmVyMg==');
    expect(response.viewer.posts.edges[0].node.title).toBe('Deuxieme article possédé par un owner');
  });

  it('should correctly fetch all posts if given `query` is empty', async () => {
    const response = await graphql(
      ViewerPostsQueryFilterByQuery,
      {
        query: '',
      },
      'internal_theo',
    );

    expect(response.viewer.posts.totalCount).toBe(22);
    expect(response.viewer.posts.edges).toHaveLength(22);
  });

  it('should correctly order posts by a given field and direction', async () => {
    const response = await graphql(
      ViewerPostsQueryOrderBy,
      {
        orderBy: { field: 'UPDATED_AT', direction: 'ASC' },
      },
      'internal_theo',
    );

    expect(response.viewer.posts.edges[0].node.updatedAt).toBe('2019-01-01 00:00:00');
    expect(response.viewer.posts.edges[1].node.updatedAt).toBe('2020-01-08 00:00:00');
  });
});
