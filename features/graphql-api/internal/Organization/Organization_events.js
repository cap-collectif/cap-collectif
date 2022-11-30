/* eslint-env jest */
const OrganizationEvents = /* GraphQL */ `
  query OrganizationEvents($organizationId: ID!, $status: EventStatus, $search: String) {
    node(id: $organizationId) {
      ... on Organization {
        id
        events(status: $status, search: $search) {
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
  it('orga member should be able to fetch deleted events', async () => {
    await expect(
      graphql(
        OrganizationEvents,
        {
          organizationId: toGlobalId('Organization', 'organization1'),
          status: 'DELETED'
        },
        'internal_omar'
      ),
    ).resolves.toMatchSnapshot();
  });
  it('orga member should be able to fetch events filtered by query', async () => {
    await expect(
      graphql(
        OrganizationEvents,
        {
          organizationId: toGlobalId('Organization', 'organization1'),
          search: 'supprimé'
        },
        'internal_omar'
      ),
    ).resolves.toMatchSnapshot();
  });
});