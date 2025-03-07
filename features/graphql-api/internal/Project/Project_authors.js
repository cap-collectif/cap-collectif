/* eslint-dev jest*/
const ProjectAuthorsQuery = /* GraphQL */ `
  query ProjectAuthors(
    $projectId: ID!
  ) {
    project: node(id: $projectId) {
      id
      ... on Project {
        authors {
          avatarUrl
        }
      }
    }
  }
`;

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
    ).resolves.toMatchSnapshot();
  });
});
