// @ts-nocheck
import { graphql } from 'react-relay'
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes'
import environment from '~/createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AddDebateAnonymousVoteMutationVariables,
  AddDebateAnonymousVoteMutationResponse,
} from '~relay/AddDebateAnonymousVoteMutation.graphql'

const mutation = graphql`
  mutation AddDebateAnonymousVoteMutation($input: AddDebateAnonymousVoteInput!) {
    addDebateAnonymousVote(input: $input) {
      errorCode
      token
      debateAnonymousVote {
        id
        type
        createdAt
      }
    }
  }
`

const commit = (variables: AddDebateAnonymousVoteMutationVariables): Promise<AddDebateAnonymousVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const debateProxy = store.get(variables.input.debateId)
      if (!debateProxy) throw new Error('Expected debate to be in the store')
      const allVotes = debateProxy.getLinkedRecord('votes', {
        isPublished: true,
        first: 0,
      })
      if (!allVotes) return
      const previousValue = parseInt(allVotes.getValue('totalCount'), 10)
      allVotes.setValue(previousValue + 1, 'totalCount')

      if (variables.input.type === 'FOR') {
        const yesVotes = debateProxy.getLinkedRecord('votes', {
          isPublished: true,
          first: 0,
          type: 'FOR',
        })
        if (!yesVotes) return
        const previousValueFor = parseInt(yesVotes.getValue('totalCount'), 10)
        yesVotes.setValue(previousValueFor + 1, 'totalCount')
      }
    },
  })

export default {
  commit,
}
