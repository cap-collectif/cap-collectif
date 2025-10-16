// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import { type RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AddAnonymousReplyMutationVariables,
  AddAnonymousReplyMutationResponse,
} from '~relay/AddAnonymousReplyMutation.graphql'

type Variables = AddAnonymousReplyMutationVariables & {
  readonly anonymousRepliesIds: string[]
  readonly isAuthenticated: boolean
  readonly skipRequirementsPage: boolean
}

const mutation = graphql`
  mutation AddAnonymousReplyMutation($input: AddAnonymousReplyInput!, $isAuthenticated: Boolean!) {
    addAnonymousReply(input: $input) {
      reply {
        id
        requirementsUrl
        ...ReplyForm_reply @arguments(isAuthenticated: $isAuthenticated)
        ...ReplyLink_reply @arguments(isAuthenticated: $isAuthenticated)
      }
      questionnaire {
        step {
          project {
            contributions {
              totalCount
            }
            contributors {
              totalCount
            }
          }
        }
        id
        ...ReplyForm_questionnaire @arguments(isAuthenticated: $isAuthenticated)
        ...ReplyLink_questionnaire
      }
      participantToken
      errorCode
      shouldTriggerConsentInternalCommunication
    }
  }
`

const commit = (variables: Variables): Promise<AddAnonymousReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      if (!variables.skipRequirementsPage) {
        return
      }

      const payload = store.getRootField('addAnonymousReply')
      if (!payload) return

      if (payload.getValue('shouldTriggerConsentInternalCommunication')) {
        return
      }

      const reply = payload.getLinkedRecord('reply')
      if (!reply) return

      const rootFields = store.getRoot()
      const args = { ids: variables.anonymousRepliesIds }
      const anonymousReplies = rootFields.getLinkedRecords('nodes', args)
      if (!anonymousReplies) return

      const updatedAnonymousReplies = [...anonymousReplies, reply]
      rootFields.setLinkedRecords(updatedAnonymousReplies, 'nodes', args)
    },
  })

export default { commit }
