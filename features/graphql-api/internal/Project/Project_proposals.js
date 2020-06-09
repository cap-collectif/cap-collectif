/* eslint-env jest */
const ProjectProposalQuery = /* GraphQL */ `
  query getProjectProposals(
    $projectId: ID!
    $count: Int!
    $category: ID
    $district: ID
    $status: ID
    $step: ID
  ) {
    project: node(id: $projectId) {
      __typename
      id
      ... on Project {
        proposals(
          first: $count
          category: $category
          district: $district
          step: $step
          status: $status
        ) {
          totalCount
          edges {
            node {
              district {
                id
                name
              }
              category {
                id
                name
              }
              reference(full: false)
              id
              title
              status(step: $step) {
                id
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal.projects.proposals', () => {
  it('fetches proposals filtered by none category, district, status', async () => {
    const response = await graphql(
      ProjectProposalQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        count: 10,
        district: 'NONE',
        category: 'NONE',
        step: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBJZGY=',
        status: 'NONE',
      },
      'internal_admin',
    );
    expect(response.project.proposals).toMatchSnapshot();
    expect(response.project.proposals.edges[0].node.district).toBe(null);
    expect(response.project.proposals.edges[0].node.category).toBe(null);
    expect(response.project.proposals.edges[0].node.status).toBe(null);
  });

  it('fetches proposals filtered by step and status', async () => {
    await expect(
      graphql(
        ProjectProposalQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
          count: 10,
          district: 'NONE',
          category: 'NONE',
          step: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmQW5hbHlzZQ==',
          status: 'statusIdfAnalyse4',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
