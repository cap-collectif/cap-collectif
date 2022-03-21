/* eslint-env jest */
import '../../../_setup';

const UpdateSmsCreditMutation = /* GraphQL*/ `
    mutation UpdateSmsCreditMutation($input: UpdateSmsCreditInput!) {
      updateSmsCredit(input: $input) {
        smsCredit {
          amount
        }
        errorCode
      }
    }
`;

const input = {id: "U21zT3JkZXI6c21zT3JkZXIx", amount: 10000};

describe('mutations.updateSmsCredit', () => {
  it('should update an sms credit', async () => {
    await expect(
      graphql(
        UpdateSmsCreditMutation,
        {
          input,
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('should return SMS_CREDIT_NOT_FOUND errorCode', async () => {
    await expect(
      graphql(
        UpdateSmsCreditMutation,
        {
          input: {
            ...input,
            id: 'abc'
          }
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
