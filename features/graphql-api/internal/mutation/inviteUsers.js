/* eslint-env jest */
import '../../_setup';

const InviteUsersMutation = /* GraphQL */ `
  fragment UserInviteInfos on UserInvite {
    id
    email
    isAdmin
  }

  mutation InviteUsersMutation($input: InviteUsersInput!) {
    inviteUsers(input: $input) {
      newInvitations {
        node {
          ...UserInviteInfos
        }
      }
      updatedInvitations {
        node {
          ...UserInviteInfos
        }
      }
    }
  }
`;

describe('Internal|inviteUsers mutation access control', () => {
  const input = {
    emails: ['iwillberejected@sad.com'],
    isAdmin: true,
  };
  it('should not throw an error when the flag is activated and the user has ROLE_ADMIN', async () => {
    expect.assertions(1);
    await expect(graphql(InviteUsersMutation, { input }, 'internal_admin')).resolves.not.toBeNull();
  });
});

describe('Internal|inviteUsers mutation', () => {
  it('should invite new users as non admin', async () => {
    const response = await graphql(
      InviteUsersMutation,
      {
        input: {
          emails: ['mail@test.com', 'mail2@test.com'],
          isAdmin: false,
        },
      },
      'internal_super_admin',
    );

    expect(response.inviteUsers.newInvitations.length).toBe(2);
    expect(response.inviteUsers.newInvitations[0].node.email).toBe('mail@test.com');
    expect(response.inviteUsers.newInvitations[0].node.isAdmin).toBe(false);
    expect(response.inviteUsers.newInvitations[1].node.email).toBe('mail2@test.com');
    expect(response.inviteUsers.newInvitations[1].node.isAdmin).toBe(false);

    expect(response.inviteUsers.updatedInvitations.length).toBe(0);
  });

  it('should invite new users as admin', async () => {
    const response = await graphql(
      InviteUsersMutation,
      {
        input: {
          emails: ['mail3@test.com', 'mail4@test.com'],
          isAdmin: true,
        },
      },
      'internal_super_admin',
    );

    expect(response.inviteUsers.newInvitations.length).toBe(2);
    expect(response.inviteUsers.newInvitations[0].node.email).toBe('mail3@test.com');
    expect(response.inviteUsers.newInvitations[0].node.isAdmin).toBe(true);
    expect(response.inviteUsers.newInvitations[1].node.email).toBe('mail4@test.com');
    expect(response.inviteUsers.newInvitations[1].node.isAdmin).toBe(true);

    expect(response.inviteUsers.updatedInvitations.length).toBe(0);
  });

  it('should update existing user invitations', async () => {
    // We first invite the users for the first time
    const emails = ['mail@test.com', 'mail2@test.com'];

    await graphql(
      InviteUsersMutation,
      {
        input: {
          emails,
          isAdmin: true,
        },
      },
      'internal_super_admin',
    );

    // We then reinvite the same users, this will update the already pending invitations
    const response = await graphql(
      InviteUsersMutation,
      {
        input: {
          emails,
          isAdmin: false,
        },
      },
      'internal_super_admin',
    );

    expect(response.inviteUsers.updatedInvitations.length).toBe(2);
    expect(response.inviteUsers.updatedInvitations[0].node.email).toBe('mail@test.com');
    expect(response.inviteUsers.updatedInvitations[0].node.isAdmin).toBe(false);
    expect(response.inviteUsers.updatedInvitations[1].node.email).toBe('mail2@test.com');
    expect(response.inviteUsers.updatedInvitations[1].node.isAdmin).toBe(false);

    expect(response.inviteUsers.newInvitations.length).toBe(0);
  });
});
