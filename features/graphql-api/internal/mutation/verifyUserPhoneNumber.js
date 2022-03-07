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
