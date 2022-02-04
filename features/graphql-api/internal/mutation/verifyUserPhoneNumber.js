/* eslint-env jest */
import '../../_setup';

const VerifyUserPhoneNumberMutation = /* GraphQL */ `
  mutation VerifyUserPhoneNumber($input: VerifyUserPhoneNumberInput!) {
    verifyUserPhoneNumber(input: $input) {
      errorCode
      user {
        email
        phoneConfirmed
      }
    }
  }
`;

describe('Internal|verifyUserPhoneNumber mutation', () => {
  it('should verify phone number correctly', async () => {
    await expect(
      graphql(
        VerifyUserPhoneNumberMutation,
        {
          input: {
            code: '123456',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should return CODE_NOT_VALID errorCode', async () => {
    await expect(
      graphql(
        VerifyUserPhoneNumberMutation,
        {
          input: {
            code: '111111',
          },
        },
        'internal_kiroule',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should return CODE_EXPIRED errorCode', async () => {
    await expect(
      graphql(
        VerifyUserPhoneNumberMutation,
        {
          input: {
            code: '123456',
          },
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should return PHONE_ALREADY_CONFIRMED errorCode', async () => {
    await expect(
      graphql(
        VerifyUserPhoneNumberMutation,
        {
          input: {
            code: '123456',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
