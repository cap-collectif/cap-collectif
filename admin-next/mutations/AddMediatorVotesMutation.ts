import { ConnectionHandler, graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type {
  AddMediatorVotesMutation,
  AddMediatorVotesMutationResponse,
  AddMediatorVotesMutationVariables,
} from '@relay/AddMediatorVotesMutation.graphql'
import { RecordSourceSelectorProxy } from 'relay-runtime'

const mutation = graphql`
  mutation AddMediatorVotesMutation($input: AddMediatorVotesInput!) {
    addMediatorVotes(input: $input) {
      participant {
        token
        id
        createdAt
        firstname
        lastname
        email
        votes {
          edges {
            node {
              id
              isAccounted
            }
          }
        }
      }
    }
  }
`

const commit = (
  variables: AddMediatorVotesMutationVariables,
  connectionName,
): Promise<AddMediatorVotesMutationResponse> =>
  commitMutation<AddMediatorVotesMutation>(environment, {
    mutation,
    variables,
    updater: (store: RecordSourceSelectorProxy) => {
      const participant = store.getRootField('addMediatorVotes')?.getLinkedRecord('participant')
      const votes = participant?.getLinkedRecord('votes')?.getLinkedRecords('edges')
      const participantID = participant?.getValue('id')

      if (!participant || !votes || !participantID) return

      participant.setLinkedRecord(participant?.getLinkedRecord('votes'), 'votes', {
        mediatorId: variables.input.mediatorId,
      })
      const edgeID = `client:newTmpEdge:${participantID}`
      const newEdge = store.create(edgeID, 'ParticipantEdge')
      newEdge.setLinkedRecord(participant, 'node')
      const connection = store.get(connectionName)
      ConnectionHandler.insertEdgeBefore(connection, newEdge)
      const totalCount = parseInt(connection.getValue('totalCount') as string, 10)
      connection.setValue(totalCount + 1, 'totalCount')
    },
  })

export default { commit }
