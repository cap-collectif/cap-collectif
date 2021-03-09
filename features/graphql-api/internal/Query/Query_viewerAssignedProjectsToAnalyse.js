/* eslint-env jest */
// TODO remove writes from tests.
import '../../_setup';

const InternalQuery = /* GraphQL */ `
  query ViewerAssignedProjectsToAnalyse {
    viewerAssignedProjectsToAnalyse {
      title
      analysts {
        id
        username
      }
      supervisors {
        id
        username
      }
      decisionMakers {
        id
        username
      }
      categories {
        id
        name
      }
      viewerAssignedProposals {
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

const InternalSortProposalQuery = /* GraphQL */ `
  query ViewerAssignedProjectsToAnalyse(
    $state: ProposalTaskState
    $decisionMaker: ID
    $district: ID
    $category: ID
    $analysts: [ID!]
  ) {
    viewerAssignedProjectsToAnalyse {
      title
      viewerAssignedProposals(
        state: $state
        decisionMaker: $decisionMaker
        district: $district
        category: $category
        analysts: $analysts
      ) {
        totalCount
        edges {
          node {
            id
            title
            district {
              id
            }
            category {
              id
            }
          }
        }
      }
    }
  }
`;

const AssignedViewerProposalsByProjectQuery = /* GraphQL */ `
  query AssignedViewerProposalsByProjectQuery($projectId: ID!, $state: ProposalTaskState) {
    node(id: $projectId) {
      ... on Project {
        viewerAssignedProposals(state: $state) {
          totalCount
          edges {
            node {
              id
              analyses {
                id
                state
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Query.viewerAssignedProjectsToAnalyse', () => {
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as supervisor', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_supervisor')).resolves.toMatchSnapshot();
  });
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as decision maker', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_decision_maker')).resolves.toMatchSnapshot();
  });
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as analyst', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_analyst')).resolves.toMatchSnapshot();
  });
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as admin', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches all proposals in state DONE; Logged as supervisor', async () => {
    await expect(
      graphql(
        InternalSortProposalQuery,
        {
          state: 'DONE',
          category: null,
          district: null,
          decisionMaker: null,
          analysts: null,
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches all proposals in state TODO; Logged as supervisor', async () => {
    await expect(
      graphql(
        InternalSortProposalQuery,
        {
          state: 'TODO',
          category: null,
          district: null,
          decisionMaker: null,
          analysts: null,
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches all proposals; Logged as supervisor', async () => {
    await expect(
      graphql(
        InternalSortProposalQuery,
        {
          state: null,
          category: null,
          district: null,
          decisionMaker: null,
          analysts: null,
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches all proposals sort by category; Logged as supervisor', async () => {
    await expect(
      graphql(
        InternalSortProposalQuery,
        {
          category: 'pCategoryAssigned1',
          state: null,
          district: null,
          decisionMaker: null,
          analysts: null,
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches all proposals sort by decisionMaker; Logged as supervisor', async () => {
    await expect(
      graphql(
        InternalSortProposalQuery,
        {
          decisionMaker: 'VXNlcjp1c2VyRGVjaXNpb25NYWtlcg==',
          state: null,
          category: null,
          district: null,
          analysts: null,
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches all proposals sort by district; Logged as supervisor', async () => {
    await expect(
      graphql(
        InternalSortProposalQuery,
        {
          district: 'district1',
          state: null,
          decisionMaker: null,
          category: null,
          analysts: null,
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches all proposals sort by analysts; Logged as supervisor', async () => {
    await expect(
      graphql(
        InternalSortProposalQuery,
        {
          district: null,
          state: null,
          decisionMaker: null,
          category: null,
          analysts: ['VXNlcjp1c2VyQW5hbHlzdA=='],
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches viewer's assigned TODO proposal by project", async () => {
    await expect(
      graphql(
        AssignedViewerProposalsByProjectQuery,
        {
          projectId: 'UHJvamVjdDpwcm9qZWN0QW5hbHlzZQ==',
          state: 'TODO',
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot();
  });
});
