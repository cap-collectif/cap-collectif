/* eslint-dev jest*/
const ProjectAuthorsQuery = /* GraphQL */ `
  query ProjectAuthors($projectId: ID!) {
    project: node(id: $projectId) {
      id
      ... on Project {
        authors {
          avatarUrl
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal.projects.authors', () => {
  it('Check its display logo organization for project', async () => {
    await expect(
      graphql(
        ProjectAuthorsQuery,
        {
          projectId: toGlobalId('Project', 'projectOrgaVisibilityAdminAndMe'),
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
