/* eslint-env jest */
import '../../../_setup';

const AddSmsCreditMutation = /* GraphQL*/ `
    mutation AddSmsCreditMutation($input: AddSmsCreditInput!) {
      addSmsCredit(input: $input) {
        smsCredit {
          amount
          id
        }
        errorCode
      }
    }
`;

const input = {amount: 5000, smsOrder: "U21zT3JkZXI6c21zT3JkZXIy"};

describe('mutations.addSmsCredit', () => {
  it('should create an sms credit', async () => {
    await expect(
      graphql(
        AddSmsCreditMutation,
        {
          input,
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot({
      addSmsCredit: {
        smsCredit: {
          id: expect.any(String)
        }
      }
    });
  });
  it('should return ORDER_ALREADY_PROCESSED errorCode', async () => {
    await expect(
      graphql(
        AddSmsCreditMutation,
        {
          input,
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
