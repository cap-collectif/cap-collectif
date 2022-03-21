/* eslint-env jest */
import '../../../_setup';

const CreateSmsOrderMutation = /* GraphQL*/ `
    mutation CreateSmsOrder($input: CreateSmsOrderInput!) {
        createSmsOrder(input: $input) {
            smsOrder {
                id
                amount
            }
        }
    }
`;

const input = {
  amount: 2000
};

describe('mutations.createSmsOrder', () => {

  it('should create an sms order', async () => {
    await expect(
      graphql(
        CreateSmsOrderMutation,
        {
          input,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createSmsOrder: {
        smsOrder: {
          id: expect.any(String)
        }
      }
    });
  });
});
