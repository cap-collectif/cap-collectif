/* eslint-env jest */
import '../../../_setupES'

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
  it('fetches the proposals of a public project as anonymous', async () => {
    const response = await graphql(
      ProjectProposalsQuery,
      { id: global.toGlobalId('Project', 'project6'), isAuthenticated: false },
      'internal',
    )
    expect(response.project.proposals).toMatchSnapshot()
    expect(response.viewer).toBe(undefined)
  })

  it('fetches the proposals of a private project', async () => {
    const response = await graphql(
      ProjectProposalsQuery,
      { id: global.toGlobalId('Project', 'projectAccessibleForAdmin'), isAuthenticated: false },
      'internal',
    )
    expect(response.project).toBe(null)
    expect(response.viewer).toBe(undefined)
  })

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
