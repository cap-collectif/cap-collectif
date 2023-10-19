// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  DeleteDebateAnonymousArgumentMutationVariables,
  DeleteDebateAnonymousArgumentMutationResponse,
} from '~relay/DeleteDebateAnonymousArgumentMutation.graphql'

type Variables = DeleteDebateAnonymousArgumentMutationVariables & {
  debateId: string
}
const mutation = graphql`
  mutation DeleteDebateAnonymousArgumentMutation($input: DeleteDebateAnonymousArgumentInput!, $connections: [ID!]!) {
    deleteDebateAnonymousArgument(input: $input) {
      errorCode
      deletedDebateAnonymousArgumentId @deleteEdge(connections: $connections)
      debate {
        id
      }
    }
  }
`

const commit = (variables: Variables): Promise<DeleteDebateAnonymousArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteDebateAnonymousArgument')
      if (!payload) return
      const argument = payload.getValue('deletedDebateAnonymousArgumentId')
      if (!argument || typeof argument !== 'string') return
      const argumentProxy = store.get(argument)

      if (!argumentProxy) {
        throw new Error('Expected argument to be in the store')
      }

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
  })

export default {
  commit,
}
