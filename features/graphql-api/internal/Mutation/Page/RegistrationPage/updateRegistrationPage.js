/* eslint-env jest */
import '../../../../_setupDB'

const UpdateRegistrationPageMutation = /* GraphQL*/ `
    mutation UpdateRegistrationPageMutation($input: UpdateRegistrationPageInput!) {
      updateRegistrationPage(input: $input) {
        customcode
      }
    }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.updateRegistrationPage', () => {
  it('GraphQL admin wants to update registration page code', async () => {
    await expect(
      graphql(
        UpdateRegistrationPageMutation,
        {
          input: {
            customcode: "<script>console.log('Bonjour');</script>",
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
