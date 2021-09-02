/* eslint-env jest */
const ViewerProjectsAffiliationsQuery = /* GraphQL */ `
  query ViewerProjectsQuery($affiliations: [ProjectAffiliation!]) {
    viewer {
      projects(affiliations: $affiliations) {
        totalCount
        edges {
          node {
            owner {
              username
            }
            authors {
              username
            }
          }
        }
      }
    }
  }
`;

const ViewerProjectsSearchQuery = /* GraphQL */ `
  query ViewerProjectsQuery($query: String) {
    viewer {
      projects(query: $query) {
        totalCount
        edges {
          node {
            title
          }
        }
      }
    }
  }
`;

const ViewerProjectsOrderQuery = /* GraphQL */ `
  query ViewerProjectsQuery($order: ProjectOwnerProjectOrder) {
    viewer {
      projects(orderBy: $order) {
        totalCount
        edges {
          node {
            title
            publishedAt
          }
        }
      }
    }
  }
`;

describe('Internal.viewer.projects', () => {
  it('should correctly fetch projects that a user owns when given the `OWNER` affiliations', async () => {
    const response = await graphql(
      ViewerProjectsAffiliationsQuery,
      {
        affiliations: ['OWNER'],
      },
      'internal_theo',
    );

    expect(response.viewer.projects.totalCount).toBe(1);
    expect(response.viewer.projects.edges).toHaveLength(1);
    expect(response.viewer.projects.edges[0].node.owner.username).toBe('Théo QP');
  });

  it('should fetch all projects when no affiliations given', async () => {
    await expect(
      graphql(
        ViewerProjectsAffiliationsQuery,
        {
          affiliations: [],
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should filter projects by a given search query', async () => {
    await expect(
      graphql(
        ViewerProjectsSearchQuery,
        {
          query: 'project',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should sort projects by a given field and direction', async () => {
    await expect(
      graphql(
        ViewerProjectsOrderQuery,
        {
          order: {
            direction: 'ASC',
            field: 'PUBLISHED_AT',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should filter project by author', async () => {
    await expect(
      graphql(
        ViewerProjectsAffiliationsQuery,
        {
          affiliations: ['AUTHOR'],
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
});
