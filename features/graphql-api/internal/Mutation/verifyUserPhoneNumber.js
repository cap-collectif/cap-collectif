/* eslint-env jest */
import '../../_setupDB'

const VerifyUserPhoneNumberMutation = /* GraphQL */ `
  mutation VerifyUserPhoneNumber($input: VerifyUserPhoneNumberInput!) {
    verifyUserPhoneNumber(input: $input) {
      errorCode
      reconciliationMode
      user {
        email
        phoneConfirmed
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
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
    ).resolves.toMatchSnapshot()
  })
})
