/* eslint-env jest */
const OrganizationProjects = /* GraphQL */ `
  query OrganizationProjects($organizationId: ID!) {
    node(id: $organizationId) {
      ... on Organization {
        id
        projects {
          totalCount
          edges {
            node {
              title
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Organization.Projects', () => {
  it('anonymous should be able to fetch public projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjects,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
        },
        'internal'
      ),
    ).resolves.toMatchSnapshot();
  });
})