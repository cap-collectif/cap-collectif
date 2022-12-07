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
              visibility
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
  it('orga member should be able to fetch projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjects,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
  it('admin should be able to fetch projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjects,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
        },
        'internal_admin'
      ),
    ).resolves.toMatchSnapshot();
  });
  it('super admin should be able to fetch projects from organization', async () => {
    await expect(
      graphql(
        OrganizationProjects,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
        },
        'internal_super_admin'
      ),
    ).resolves.toMatchSnapshot();
  });
})