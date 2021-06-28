//* eslint-env jest */
const UserInvitationsQuery = /* GraphQL */ `
  query UserInvitationsQuery {
    userInvitations {
      edges {
        node {
          id
          email
          isAdmin
          isProjectAdmin
        }
      }
    }
  }
`;

const DENIED_ERROR_MESSAGE = 'Access denied to this field';

describe('Internal|UserInvitations query', () => {
  it('should fetch the current available user invitations', async () => {
    await expect(
      graphql(UserInvitationsQuery, {}, 'internal_super_admin'),
    ).resolves.toMatchSnapshot();
  });
});

describe('Internal|UserInvitations query access control', () => {
  it('should not throw an error has ROLE_ADMIN', async () => {
    expect.assertions(1);
    await expect(graphql(UserInvitationsQuery, {}, 'internal_admin')).resolves.not.toBeNull();
  });
});
