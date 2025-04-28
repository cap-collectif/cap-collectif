/* eslint-dev jest*/
const ProjectStatusQuery = /* GraphQL */ `
  query ProjectStatus($projectStatus: ID!) {
    projects(status: $projectStatus) {
      edges {
        node {
          title
          status
        }
      }
    }
  }
`;

describe('Internal project status', () => {
  it('OPENED_PARTICIPATION project', async () => {
    await expect(
      graphql(
        ProjectStatusQuery,
        {
          projectStatus: 2,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('CLOSED_PARTICIPATION project', async () => {
    await expect(
      graphql(
        ProjectStatusQuery,
        {
          projectStatus: 3,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('FUTURE_PARTICIPATION project', async () => {
    await expect(
      graphql(
        ProjectStatusQuery,
        {
          projectStatus: 0,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
