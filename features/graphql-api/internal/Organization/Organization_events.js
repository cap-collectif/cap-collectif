/* eslint-env jest */
const OrganizationEvents = /* GraphQL */ `
  query OrganizationEvents($organizationId: ID!) {
    node(id: $organizationId) {
      ... on Organization {
        id
        events {
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

describe('Internal|Organization.Events', () => {
  it('anonymous should be able to fetch approved projects from organization', async () => {
    await expect(
      graphql(
        OrganizationEvents,
        {
          organizationId: toGlobalId('Organization', 'organization1'),
        },
        'internal'
      ),
    ).resolves.toMatchSnapshot();
  });
});