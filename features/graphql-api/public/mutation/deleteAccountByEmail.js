/* eslint-env jest */
import '../../_setup';

const DeleteAccountByEmail = /* GraphQL */ `
  mutation deleteAccountByEmail($input: DeleteAccountByEmailInput!) {
    deleteAccountByEmail(input: $input) {
      email
      errorCode
    }
  }
`;

describe('Delete user by email', () => {
  it('Delete non-existing user by email', async () => {
    await expect(
      graphql(
        DeleteAccountByEmail,
        { input: { email: 'nonExistingUser@cap-collectif.com' } },
        'super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('Delete super admin user by email', async () => {
    await expect(
      graphql(
        DeleteAccountByEmail,
        { input: { email: 'lbrunet@cap-collectif.com' } },
        'super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('Can delete user by email with admin role', async () => {
    await expect(
      graphql(
        DeleteAccountByEmail,
        { input: { email: 'userToDelete@cap-collectif.com' } },
        'admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('Cannot delete user by email with user role', async () => {
    await expect(
      graphql(
        DeleteAccountByEmail,
        { input: { email: 'userToDelete@cap-collectif.com' } },
        'user',
      ),
    ).rejects.toMatchSnapshot();
  });
});
