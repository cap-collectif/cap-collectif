/* eslint-env jest */
import '../../_setup';

const DENIED_ERROR_MESSAGE = 'Access denied to this field';

const CancelUserInvitationsMutation = /* GraphQL */ `
  mutation CancelUserInvitationsMutation($input: CancelUserInvitationsInput!) {
    cancelUserInvitations(input: $input) {
      cancelledInvitationsIds
    }
  }
`;

describe('Internal|cancelUserInvitations mutation access control', () => {
  const input = {
    invitationsIds: [
      toGlobalId('UserInvite', "Blah blah blah d'la pookie"),
      toGlobalId('UserInvite', "Ferme la porte, t'as la pookie dans l'side"),
    ],
  };
  it('should throw an error when the flag is deactivated and the user has ROLE_SUPER_ADMIN', async () => {
    await disableFeatureFlag('user_invitations');
    expect.assertions(1);
    await expect(
      graphql(CancelUserInvitationsMutation, { input }, 'internal_super_admin'),
    ).rejects.toThrowError(DENIED_ERROR_MESSAGE);
  });
  it('should throw an error when the flag is activated and the user has ROLE_ADMIN', async () => {
    await enableFeatureFlag('user_invitations');
    expect.assertions(1);
    await expect(
      graphql(CancelUserInvitationsMutation, { input }, 'internal_admin'),
    ).rejects.toThrowError(DENIED_ERROR_MESSAGE);
  });
  it('should throw an error when the flag is deactivated and the user has ROLE_ADMIN', async () => {
    await disableFeatureFlag('user_invitations');
    expect.assertions(1);
    await expect(
      graphql(CancelUserInvitationsMutation, { input }, 'internal_admin'),
    ).rejects.toThrowError(DENIED_ERROR_MESSAGE);
  });
});

describe('Internal|cancelUserInvitations mutation', () => {
  it('should cancel user invitations', async () => {
    await enableFeatureFlag('user_invitations');

    const remInvitationId = toGlobalId('UserInvite', 'remInvitation');
    const ramInvitationId = toGlobalId('UserInvite', 'ramInvitation');

    const response = await graphql(
      CancelUserInvitationsMutation,
      {
        input: {
          invitationsIds: [remInvitationId, ramInvitationId],
        },
      },
      'internal_super_admin',
    );

    expect(response.cancelUserInvitations.cancelledInvitationsIds.length).toBe(2);
    expect(response.cancelUserInvitations.cancelledInvitationsIds[0]).toBe(remInvitationId);
    expect(response.cancelUserInvitations.cancelledInvitationsIds[1]).toBe(ramInvitationId);
  });
});
