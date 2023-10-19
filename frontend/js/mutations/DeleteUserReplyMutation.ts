// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import { ConnectionHandler } from 'relay-runtime'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  DeleteUserReplyMutationVariables,
  DeleteUserReplyMutationResponse,
} from '~relay/DeleteUserReplyMutation.graphql'

const mutation = graphql`
  mutation DeleteUserReplyMutation($input: DeleteUserReplyInput!) {
    deleteUserReply(input: $input) {
      questionnaire {
        id
      }
      replyId
    }
  }
`

const commit = (variables: DeleteUserReplyMutationVariables): Promise<DeleteUserReplyMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteUserReply')
      if (!payload) return
      const replyId = payload.getValue('replyId')
      if (!replyId || typeof replyId !== 'string') return
      const questionnaireId = payload.getLinkedRecord('questionnaire')?.getValue('id')
      if (typeof questionnaireId !== 'string') return
      const questionnaire = store.get(questionnaireId)
      if (!questionnaire) return
      const viewerReplies = questionnaire.getLinkedRecord('viewerReplies')
      if (!viewerReplies) return
      const totalCount = parseInt(viewerReplies.getValue('totalCount'), 10)
      if (!totalCount) return

      if (totalCount >= 0) {
        viewerReplies.setValue(totalCount - 1, 'totalCount')
      }

      const userRepliesConnection = ConnectionHandler.getConnection(questionnaire, 'UserReplies_userReplies')
      if (!userRepliesConnection) return
      ConnectionHandler.deleteNode(userRepliesConnection, replyId)
    },
  })

export default {
  commit,
}
