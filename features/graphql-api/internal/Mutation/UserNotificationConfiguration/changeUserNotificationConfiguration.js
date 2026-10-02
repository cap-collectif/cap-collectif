import '../../../_setupDB'

const ChangeUserNotificationConfigurationMutation = /* GraphQL */ `
  mutation ($input: ChangeUserNotificationsConfigurationInput!) {
    changeUserNotificationsConfiguration(input: $input) {
      user {
        consentExternalCommunication
        consentInternalCommunication
        notificationsConfiguration {
          onProposalCommentMail
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.changeUserNotificationConfigurationMutation', () => {
  it('GraphQL client wants to modify a user notifications configuration', async () => {
    await expect(
      graphql(
        ChangeUserNotificationConfigurationMutation,
        {
          input: {
            onProposalCommentMail: false,
            consentExternalCommunication: false,
            consentInternalCommunication: false,
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
