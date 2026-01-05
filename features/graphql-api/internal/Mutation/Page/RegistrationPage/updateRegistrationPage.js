/* eslint-env jest */
import '../../../../_setup'

const UpdateRegistrationPageMutation = /* GraphQL*/ `
    mutation UpdateRegistrationPageMutation($input: UpdateRegistrationPageInput!) {
      updateRegistrationPage(input: $input) {
        customcode
      }
    }
`

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
