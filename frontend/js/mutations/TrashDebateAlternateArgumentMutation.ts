// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '~/createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  TrashDebateAlternateArgumentMutationVariables,
  TrashDebateAlternateArgumentMutationResponse,
} from '~relay/TrashDebateAlternateArgumentMutation.graphql'

type Variables = TrashDebateAlternateArgumentMutationVariables & {
  debateId: string
  forOrAgainst: 'FOR' | 'AGAINST'
}
const mutation = graphql`
  mutation TrashDebateAlternateArgumentMutation($input: TrashInput!) {
    trash(input: $input) {
      errorCode
      trashable {
        trashed
        trashedStatus
        trashedAt
        trashedReason
        ... on DebateArgument {
          id @deleteRecord
        }
      }
    }
  }
`

const commit = (variables: Variables): Promise<TrashDebateAlternateArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const debateProxy = store.get(variables.debateId)
      if (!debateProxy) throw new Error('Expected debate to be in the store')
      const allArgumentsProxy = debateProxy.getLinkedRecord('arguments', {
        first: 0,
        isTrashed: false,
      })
      if (!allArgumentsProxy) return
      const previousValue = parseInt(allArgumentsProxy.getValue('totalCount'), 10)
      allArgumentsProxy.setValue(previousValue - 1, 'totalCount')

      if (variables.forOrAgainst === 'FOR') {
        const argumentsFor = debateProxy.getLinkedRecord('arguments', {
          first: 0,
          value: 'FOR',
          isTrashed: false,
        })
        if (!argumentsFor) return
        const countArgumentsFor = parseInt(argumentsFor.getValue('totalCount'), 10)
        argumentsFor.setValue(countArgumentsFor - 1, 'totalCount')
      } else if (variables.forOrAgainst === 'AGAINST') {
        const argumentsAgainst = debateProxy.getLinkedRecord('arguments', {
          first: 0,
          value: 'AGAINST',
          isTrashed: false,
        })
        if (!argumentsAgainst) return
        const countArgumentsAgainst = parseInt(argumentsAgainst.getValue('totalCount'), 10)
        argumentsAgainst.setValue(countArgumentsAgainst - 1, 'totalCount')
      }
    },
  })

export default {
  commit,
}
