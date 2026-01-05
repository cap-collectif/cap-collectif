/* eslint-dev jest*/
const ProjectsExcludePresentationStepQuery = /* GraphQL */ `
  query ProjectsExcludePresentationStep($projectId: ID!, $excludePresentationStep: Boolean) {
    project: node(id: $projectId) {
      id
      ... on Project {
        steps(excludePresentationStep: $excludePresentationStep) {
          __typename
          title
        }
      }
    }
  }
`

describe('Internal.project.steps', () => {
  it('should exclude presentation step if excludePresentationStep is set to true', async () => {
    await expect(
      graphql(
        ProjectsExcludePresentationStepQuery,
        {
          projectId: toGlobalId('Project', 'project1'),
          excludePresentationStep: false,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        ProjectsExcludePresentationStepQuery,
        {
          projectId: toGlobalId('Project', 'project1'),
          excludePresentationStep: true,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
