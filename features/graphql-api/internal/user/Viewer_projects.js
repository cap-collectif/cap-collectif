/* eslint-env jest */
const ViewerProjectsQuery = /* GraphQL */ `
  query ViewerProjectsQuery($affiliations: [ProjectAffiliation!]) {
    viewer {
      projects(affiliations: $affiliations) {
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

describe('Internal.viewer.projects', () => {
  it('should correctly fetch projects that a user owns when given the `OWNER` affiliations', async () => {
    const response = await graphql(
      ViewerProjectsQuery,
      {
        affiliations: ['OWNER'],
      },
      'internal_theo',
    );

    expect(response.viewer.projects.totalCount).toBe(1);
    expect(response.viewer.projects.edges).toHaveLength(1);
    expect(response.viewer.projects.edges[0].node.owner.username).toBe('Théo QP');
  });

  it('should not fetch projects that a user owns when no affiliations given', async () => {
    let response = await graphql(
      ViewerProjectsQuery,
      {
        affiliations: [],
      },
      'internal_theo',
    );

    expect(response.viewer.projects.totalCount).toBe(0);
    expect(response.viewer.projects.edges).toHaveLength(0);

    response = await graphql(ViewerProjectsQuery, {}, 'internal_theo');

    expect(response.viewer.projects.totalCount).toBe(0);
    expect(response.viewer.projects.edges).toHaveLength(0);
  });
});
