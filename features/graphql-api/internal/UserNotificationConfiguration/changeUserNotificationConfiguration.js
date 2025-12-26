import '../../_setup'

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
