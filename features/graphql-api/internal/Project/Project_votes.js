/* eslint-dev jest*/
const ProjectVotesQuery = /* GraphQL */ `
  query ProjectCounters($projectId: ID!, $anonymous: Boolean) {
    project: node(id: $projectId) {
      id
      ... on Project {
        votes(anonymous: $anonymous) {
          totalCount
        }
      }
    }
  }
`;

describe('Internal.project.votes', () => {
  it('Retrieve project votes total count', async () => {
    await expect(
      graphql(
        ProjectVotesQuery,
        {
          projectId: toGlobalId('Project', 'projectCannabis'),
          anonymous: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('Retrieve project anonymous votes total count', async () => {
    await expect(
      graphql(
        ProjectVotesQuery,
        {
          projectId: toGlobalId('Project', 'projectCannabis'),
          anonymous: true,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('Retrieve project non anonymous votes total count', async () => {
    await expect(
      graphql(
        ProjectVotesQuery,
        {
          projectId: toGlobalId('Project', 'projectCannabis'),
          anonymous: false,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('Retrieve project votes total count with multiple debates', async () => {
    await expect(
      graphql(
        ProjectVotesQuery,
        {
          projectId: toGlobalId('Project', 'projectMultiDebate'),
          anonymous: false,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
