/* eslint-env jest */
import '../../../_setupESOnce'

const ProjectProposalsQuery = /* GraphQL */ `
  query ProjectProposalsQuery($id: ID!, $isAuthenticated: Boolean!) {
    viewer @include(if: $isAuthenticated) {
      isAdmin
    }
    project: node(id: $id) {
      ... on Project {
        proposals(first: 5) {
          totalCount
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

describe('Preview|Project.proposals connection', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks viewer authentication explicitly but leaves the returned proposal contract to a
   * response snapshot.
   */
  it('fetches the proposals of a public project as anonymous', async () => {
    const response = await graphql(
      ProjectProposalsQuery,
      { id: global.toGlobalId('Project', 'project6'), isAuthenticated: false },
      'internal',
    )
    expect(response.project.proposals).toMatchSnapshot()
    expect(response.viewer).toBe(undefined)
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('fetches the proposals of a private project', async () => {
    const response = await graphql(
      ProjectProposalsQuery,
      { id: global.toGlobalId('Project', 'projectAccessibleForAdmin'), isAuthenticated: false },
      'internal',
    )
    expect(response.project).toBe(null)
    expect(response.viewer).toBe(undefined)
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks viewer authentication explicitly but leaves the returned proposal contract to a
   * response snapshot.
   */
  it('fetches the proposals of a private project as an admin', async () => {
    const response = await graphql(
      ProjectProposalsQuery,
      { id: global.toGlobalId('Project', 'projectIdf'), isAuthenticated: true },
      'internal_admin',
    )
    expect(response.project.proposals).toMatchSnapshot()
    expect(response.viewer.isAdmin).toBe(true)
  })
})
