/* eslint-env jest */
const ProjectProposalQuery = /* GraphQL */ `
  query getProjectProposals(
    $projectId: ID!
    $count: Int!
    $category: ID
    $district: ID
    $status: ID
    $step: ID
    $term: String
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
          term: $term
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

const ProjectProposalTotalCountQuery = /* GraphQL */ `
  query getProjectProposalsTotalCount(
    $projectId: ID!
    $count: Int
    $category: ID
    $district: ID
    $status: ID
    $step: ID
    $state: ProposalsState
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
          state: $state
        ) {
          totalCount
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

  it("fetches project proposal's total count (draft)", async () => {
    const response = await graphql(
      ProjectProposalTotalCountQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        state: 'DRAFT',
      },
      'internal_admin',
    );
    expect(response.project.proposals.totalCount).toBe(1);
  });

  it("fetches project proposal's total count (published)", async () => {
    const response = await graphql(
      ProjectProposalTotalCountQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        state: 'PUBLISHED',
      },
      'internal_admin',
    );
    expect(response.project.proposals.totalCount).toBe(8);
  });

  it("fetches project proposal's total count (all)", async () => {
    const response = await graphql(
      ProjectProposalTotalCountQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        state: 'ALL',
      },
      'internal_admin',
    );
    expect(response.project.proposals.totalCount).toBe(10);
  });

  it("fetches project proposal's total count (trashed)", async () => {
    const response = await graphql(
      ProjectProposalTotalCountQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        state: 'TRASHED',
      },
      'internal_admin',
    );
    expect(response.project.proposals.totalCount).toBe(1);
  });

  it("search project's proposals by given term, ordered by score", async () => {
    const response = await graphql(
      ProjectProposalQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
        state: 'ALL',
        term: 'organisme',
        count: 10,
      },
      'internal_admin',
    );
    expect(response.project.proposals).toMatchSnapshot();
  });
});
