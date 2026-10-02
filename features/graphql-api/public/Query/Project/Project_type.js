/* eslint-env jest */

const ProjectTypesQuery = /* GraphQL */ `
  query ProjectTypesQuery($id: ID!) {
    project: node(id: $id) {
      id
      ... on Project {
        type {
          title
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Preview|Project.type', () => {
  it('fetches the types of a project', async () => {
    await expect(graphql(ProjectTypesQuery, { id: toGlobalId('Project', 'project1') })).resolves.toMatchSnapshot()
  })
})
