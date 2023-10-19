// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '~/createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  RemoveDebateAnonymousVoteMutationVariables,
  RemoveDebateAnonymousVoteMutationResponse,
} from '~relay/RemoveDebateAnonymousVoteMutation.graphql'

type Variables = RemoveDebateAnonymousVoteMutationVariables & {
  debateId: string
}
const mutation = graphql`
  mutation RemoveDebateAnonymousVoteMutation($input: RemoveDebateAnonymousVoteInput!) {
    removeDebateAnonymousVote(input: $input) {
      errorCode
      deletedDebateAnonymousVoteId
      deletedDebateAnonymousArgumentId
    }
  }
`

const commit = (variables: Variables): Promise<RemoveDebateAnonymousVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('removeDebateAnonymousVote')
      if (!payload) return
      const argument = payload.getValue('deletedDebateAnonymousArgumentId')
      if (!argument || typeof argument !== 'string') return
      const argumentProxy = store.get(argument)
      if (!argumentProxy) return
      const debateProxy = store.get(variables.debateId)

      if (!debateProxy) {
        throw new Error('Expected debate to be in the store')
      }

      store.delete(argument)
      const allArgumentsProxy = debateProxy.getLinkedRecord('arguments', {
        first: 0,
        isPublished: true,
        isTrashed: false,
      })
      if (!allArgumentsProxy) return
      const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10)
      allArgumentsProxy.setValue(previousValue - 1, 'totalCount')
      const argumentsTrashed = debateProxy.getLinkedRecord('arguments', {
        first: 0,
        isPublished: true,
        isTrashed: true,
      })
      if (!argumentsTrashed) return
      const countArgumentsTrashed = parseInt(argumentsTrashed.getValue('totalCount'), 10)
      argumentsTrashed.setValue(countArgumentsTrashed - 1, 'totalCount')
    },
    optimisticResponse: {
      removeDebateAnonymousVote: {
        errorCode: null,
        deletedDebateAnonymousVoteId: new Date().toISOString(),
        deletedDebateAnonymousArgumentId: new Date().toISOString(),
      },
    },
  })

export default {
  commit,
}
