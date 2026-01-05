/* eslint-env jest */
import '../../../../_setup'

const UpdateQuestionnaireNotificationConfigurationMutation = /* GraphQL */ `
  mutation UpdateQuestionnaireNotificationConfigurationMutation(
    $input: UpdateQuestionnaireNotificationConfigurationInput!
  ) {
    updateQuestionnaireNotificationsConfiguration(input: $input) {
      questionnaire {
        id
        notificationsConfiguration {
          email
          onQuestionnaireReplyCreate
          onQuestionnaireReplyUpdate
          onQuestionnaireReplyDelete
        }
      }
    }
  }
`

describe('Internal|updateQuestionnaireNotificationConfiguration mutation', () => {
  it('should update correctly', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireNotificationConfigurationMutation,
        {
          input: {
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
            email: 'test@capco.com',
            onQuestionnaireReplyCreate: true,
            onQuestionnaireReplyUpdate: true,
            onQuestionnaireReplyDelete: true,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('should throw an access denied if a project admin user attempt to update a questionnaire notification configuration that he does not own', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireNotificationConfigurationMutation,
        {
          input: {
            questionnaireId: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==',
            email: 'test@capco.com',
            onQuestionnaireReplyCreate: true,
            onQuestionnaireReplyUpdate: true,
            onQuestionnaireReplyDelete: true,
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('should throw an access denied when questionnaire does not exist', async () => {
    await expect(
      graphql(
        UpdateQuestionnaireNotificationConfigurationMutation,
        {
          input: {
            questionnaireId: 'abc',
            email: 'test@capco.com',
            onQuestionnaireReplyCreate: true,
            onQuestionnaireReplyUpdate: true,
            onQuestionnaireReplyDelete: true,
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
