/* eslint-env jest */
import '../../../_setupDB'

const CreateSmsOrderMutation = /* GraphQL*/ `
    mutation CreateSmsOrder($input: CreateSmsOrderInput!) {
        createSmsOrder(input: $input) {
            smsOrder {
                id
                amount
            }
        }
    }
`

const input = {
  amount: 2000,
}

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
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
          id: expect.any(String),
        },
      },
    })
  })
})
