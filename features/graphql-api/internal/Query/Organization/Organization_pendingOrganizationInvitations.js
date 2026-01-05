/* eslint-env jest */
const OrganizationPendingOrganizationInvitation = /* GraphQL */ `
  query OrganizationPendingOrganizationInvitation($organizationId: ID!) {
    node(id: $organizationId) {
      ... on Organization {
        id
        pendingOrganizationInvitations {
          totalCount
          edges {
            node {
              user {
                email
              }
              email
              role
              organization {
                title
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|Organization.PendingOrganizationInvitation', () => {
  it('admin should be able to fetch invitations', async () => {
    await expect(
      graphql(
        OrganizationPendingOrganizationInvitation,
        {
          organizationId: toGlobalId('Organization', 'organization1'),
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('organization member with role admin should be able to fetch invitations', async () => {
    await expect(
      graphql(
        OrganizationPendingOrganizationInvitation,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('organization member with role user should not be able to fetch invitations', async () => {
    await expect(
      graphql(
        OrganizationPendingOrganizationInvitation,
        {
          organizationId: toGlobalId('Organization', 'organization1'),
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
