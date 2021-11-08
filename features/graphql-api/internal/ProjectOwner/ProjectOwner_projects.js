/* eslint-env jest */
const ProjectOwnerProjectsAffiliationsQuery = /* GraphQL */ `
  query ProjectOwnerProjectsQuery($affiliations: [ProjectAffiliation!]) {
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

const ProjectOwnerProjectsSearchQuery = /* GraphQL */ `
  query ProjectOwnerProjectsQuery($query: String) {
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

const ProjectOwnerProjectsOrderQuery = /* GraphQL */ `
  query ProjectOwnerProjectsQuery($order: ProjectOwnerProjectOrder) {
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
      ProjectOwnerProjectsAffiliationsQuery,
      {
        affiliations: ['OWNER'],
      },
      'internal_theo',
    );

    expect(response.viewer.projects.totalCount).toBe(2);
    expect(response.viewer.projects.edges).toHaveLength(2);
    expect(response.viewer.projects.edges[0].node.owner.username).toBe('Théo QP');
  });

  it('should fetch all projects when no affiliations given', async () => {
    await expect(
      graphql(
        ProjectOwnerProjectsAffiliationsQuery,
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
        ProjectOwnerProjectsSearchQuery,
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
        ProjectOwnerProjectsOrderQuery,
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
        ProjectOwnerProjectsAffiliationsQuery,
        {
          affiliations: ['AUTHOR'],
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
});
