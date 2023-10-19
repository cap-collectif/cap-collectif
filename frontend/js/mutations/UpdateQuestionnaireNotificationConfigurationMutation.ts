// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateQuestionnaireNotificationConfigurationMutationVariables,
  UpdateQuestionnaireNotificationConfigurationMutationResponse,
} from '~relay/UpdateQuestionnaireNotificationConfigurationMutation.graphql'

const mutation = graphql`
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

const commit = (
  variables: UpdateQuestionnaireNotificationConfigurationMutationVariables,
): Promise<UpdateQuestionnaireNotificationConfigurationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
