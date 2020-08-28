const ProjectViewerAssignedProposalsQuery = /* GraphQL */ `
  query getProjectViewerAssignedProposals($projectId: ID!, $category: ID, $district: ID) {
    project: node(id: $projectId) {
      __typename
      id
      ... on Project {
        viewerAssignedProposals(category: $category, district: $district) {
          totalCount
          edges {
            node {
              id
              category {
                id
                name
              }
              district {
                id
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Project.viewerAssignedProposals', () => {
  it("fetches viewer's assigned proposals by project, category (NONE)", async () => {
    await expect(
      graphql(
        ProjectViewerAssignedProposalsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
          category: 'NONE',
        },
        { email: 'maxime.pouessel@cap-collectif.com', password: 'toto' },
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches viewer's assigned proposals by project, category (pCategoryIdf2).", async () => {
    await expect(
      graphql(
        ProjectViewerAssignedProposalsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
          category: 'pCategoryIdf2',
        },
        { email: 'maxime.pouessel@cap-collectif.com', password: 'toto' },
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches viewer's assigned proposals by project, district (NONE).", async () => {
    await expect(
      graphql(
        ProjectViewerAssignedProposalsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
          district: 'NONE',
        },
        { email: 'maxime.pouessel@cap-collectif.com', password: 'toto' },
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches viewer's assigned proposals by project, district (districtIdf2).", async () => {
    await expect(
      graphql(
        ProjectViewerAssignedProposalsQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
          district: 'districtIdf2',
        },
        { email: 'maxime.pouessel@cap-collectif.com', password: 'toto' },
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches viewer's assigned proposals by project, district (districtIdf2), category (NONE).", async () => {
    const response = await graphql(
      ProjectViewerAssignedProposalsQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        district: 'districtIdf2',
        category: 'NONE',
      },
      { email: 'maxime.pouessel@cap-collectif.com', password: 'toto' },
    );
    expect(response.project.viewerAssignedProposals.totalCount).toBe(0);
  });

  it("fetches viewer's assigned proposals by project, district (NONE), category (pCategoryIdf2).", async () => {
    const response = await graphql(
      ProjectViewerAssignedProposalsQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        district: 'NONE',
        category: 'pCategoryIdf2',
      },
      { email: 'maxime.pouessel@cap-collectif.com', password: 'toto' },
    );
    expect(response.project.viewerAssignedProposals.totalCount).toBe(0);
  });
});
