//* eslint-env jest */
const UserInvitationsQuery = /* GraphQL */ `
  query UserInvitationsQuery {
    userInvitations {
      edges {
        node {
          id
          email
          isAdmin
        }
      }
    }
  }
`;

const DENIED_ERROR_MESSAGE = 'Access denied to this field';

describe('Internal|UserInvitations query', () => {
  it('should fetch the current available user invitations when the flag is activated', async () => {
    await enableFeatureFlag('user_invitations');
    await expect(
      graphql(UserInvitationsQuery, {}, 'internal_super_admin'),
    ).resolves.toMatchSnapshot();
  });
});

describe('Internal|UserInvitations query access control', () => {
  it('should throw an error when the flag is deactivated and the user has ROLE_SUPER_ADMIN', async () => {
    await disableFeatureFlag('user_invitations');
    expect.assertions(1);
    await expect(graphql(UserInvitationsQuery, {}, 'internal_super_admin')).rejects.toThrowError(
      DENIED_ERROR_MESSAGE,
    );
  });
  it('should not throw an error when the flag is activated and the user has ROLE_ADMIN', async () => {
    await enableFeatureFlag('user_invitations');
    expect.assertions(1);
    await expect(graphql(UserInvitationsQuery, {}, 'internal_admin')).resolves.not.toBeNull();
  });
  it('should throw an error when the flag is deactivated and the user has ROLE_ADMIN', async () => {
    await disableFeatureFlag('user_invitations');
    expect.assertions(1);
    await expect(graphql(UserInvitationsQuery, {}, 'internal_admin')).rejects.toThrowError(
      DENIED_ERROR_MESSAGE,
    );
  });
});
