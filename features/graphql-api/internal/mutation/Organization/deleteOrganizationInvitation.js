/* eslint-env jest */
import '../../../_setup';

const DeleteOrganizationInvitation = /* GraphQL */ `
  mutation DeleteOrganizationInvitation($input: DeleteOrganizationInvitationInput!) {
    deleteOrganizationInvitation(input: $input) {
      invitationId
      errorCode
    }
  }
`;

const OrganizationPendingOrganizationInvitationsQuery = /* GraphQL */ `
  query OrganizationPendingOrganizationInvitationsQuery {
    node(id: "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=") {
      ...on Organization {
          pendingOrganizationInvitations {
            totalCount
            edges {
              node {
                user {
                  email
                }
                email
              }
            }
          }
        }
      }
  }
`;



const input = {
  "invitationId": toGlobalId('PendingOrganizationInvitation','inviteMaxime'), // UGVuZGluZ09yZ2FuaXphdGlvbkludml0YXRpb246aW52aXRlTWF4aW1l
}

describe('Internal|deleteOrganizationInvitation mutation', () => {
  it('should delete an invitation as admin', async () => {
    const deleteInvitationResponse = await graphql(
      DeleteOrganizationInvitation,
      {
        input,
      },
      'internal_mickael',
    );
    expect(deleteInvitationResponse).toMatchSnapshot();

    const organizationPendingOrganizationInvitationsQueryResponse = await graphql(
      OrganizationPendingOrganizationInvitationsQuery,
      {},
      'internal_admin',
    );
    expect(organizationPendingOrganizationInvitationsQueryResponse).toMatchSnapshot();
  });

  it('should delete an invitation when called with admin organization who belongs to the org', async () => {
    const deleteInvitationResponse = await graphql(
      DeleteOrganizationInvitation,
      {
        input: {
          invitationId: toGlobalId('PendingOrganizationInvitation','inviteWelcomatic') //UGVuZGluZ09yZ2FuaXphdGlvbkludml0YXRpb246aW52aXRlV2VsY29tYXRpYw==
        },
      },
      'internal_mickael',
    );

    expect(deleteInvitationResponse).toMatchSnapshot();

    const organizationPendingOrganizationInvitationsQueryResponse = await graphql(
      OrganizationPendingOrganizationInvitationsQuery,
      {},
      'internal_admin',
    );

    expect(organizationPendingOrganizationInvitationsQueryResponse).toMatchSnapshot();
  });

  it('should forbid organization member who belongs to the org to delete the invitation', async () => {
    await expect(
      graphql(
        DeleteOrganizationInvitation,
        {
          input,
        },
        'internal_omar',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  })

  it('should forbid admin organization who does not belong to the org to delete the invitation', async () => {
    await expect(
      graphql(
        DeleteOrganizationInvitation,
        {
          input,
        },
        'internal_valerie',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  })
})