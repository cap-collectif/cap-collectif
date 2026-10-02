/* eslint-env jest */

const ProjectStepsQuery = /* GraphQL */ `
  query ProjectStepsQuery($id: ID!) {
    project: node(id: $id) {
      id
      ... on Project {
        steps {
          id
          title
          state
          __typename
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Preview|Project.steps array', () => {
  it('fetches the steps of a project with consultation', async () => {
    await expect(graphql(ProjectStepsQuery, { id: toGlobalId('Project', 'project1') })).resolves.toMatchSnapshot()
  })

  it('fetches the steps of a project with participative budget', async () => {
    await expect(graphql(ProjectStepsQuery, { id: toGlobalId('Project', 'project6') })).resolves.toMatchSnapshot()
  })
})
