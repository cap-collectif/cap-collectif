/* eslint-env jest */

const ProjectContributorsQuery = /* GraphQL */ `
  query ProjectContributorsQuery($id: ID!) {
    project: node(id: $id) {
      id
      ... on Project {
        contributors(first: 5) {
          totalCount
          anonymousCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Preview|Project.contributors connection', () => {
  it('fetches the contributiors of a project', async () => {
    await expect(
      graphql(ProjectContributorsQuery, { id: 'UHJvamVjdDpwcm9qZWN0MQ==' }, 'internal'),
    ).resolves.toMatchSnapshot()
  })
})
