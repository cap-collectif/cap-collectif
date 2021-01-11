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
  it('Delete existing user by email', async () => {
    await expect(
      graphql(
        DeleteAccountByEmail,
        { input: { email: 'userToDelete@cap-collectif.com' } },
        'super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

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
      graphql(DeleteAccountByEmail, { input: { email: 'lbrunet@jolicode.com' } }, 'super_admin'),
    ).resolves.toMatchSnapshot();
  });
});
