/* eslint-env jest */
const ProjectAdminAnalysisTabQuery = /* GraphQL */ `
  query ProjectAdminAnalysisTabQuery(
    $projectId: ID!
    $count: Int!
    $category: ID
    $district: ID
    $supervisor: ID
    $analysts: [ID!]
    $decisionMaker: ID
  ) {
    project: node(id: $projectId) {
      id
      ... on Project {
        firstAnalysisStep {
          proposals(
            first: $count
            category: $category
            district: $district
            supervisor: $supervisor
            analysts: $analysts
            decisionMaker: $decisionMaker
          ) {
            edges {
              node {
                supervisor {
                  id
                }
                analysts {
                  id
                }
                decisionMaker {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Query.ProjectAdminAnalysisTab', () => {
  it('fetches proposals assigned to specific analysts, supervisor, decisionMaker', async () => {
    await expect(
      graphql(
        ProjectAdminAnalysisTabQuery,
        {
          category: null,
          count: 5,
          district: null,
          projectId: 'UHJvamVjdDpwcm9qZWN0SWRm',
          analysts: ['VXNlcjp1c2VyTWF4aW1l', 'VXNlcjp1c2VyQWd1aQ=='],
          supervisor: 'VXNlcjp1c2VyU3B5bA==',
          decisionMaker: 'VXNlcjp1c2VyTWF4aW1lUUE=',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
