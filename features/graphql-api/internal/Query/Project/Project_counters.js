/* eslint-dev jest*/
const ProjectCountersQuery = /* GraphQL */ `
  query ProjectCounters($projectId: ID!) {
    project: node(id: $projectId) {
      id
      ... on Project {
        votes {
          totalCount
        }
        contributions {
          totalCount
        }
        contributors {
          totalCount
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal.project counters', () => {
  it('fetches participations counters by project', async () => {
    await expect(
      graphql(
        ProjectCountersQuery,
        {
          projectId: toGlobalId('Project', 'projectCannabis'),
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
