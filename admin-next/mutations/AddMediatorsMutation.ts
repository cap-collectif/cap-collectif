import { ConnectionHandler, graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type {
  AddMediatorsMutation,
  AddMediatorsMutationResponse,
  AddMediatorsMutationVariables,
} from '@relay/AddMediatorsMutation.graphql'

const mutation = graphql`
  mutation AddMediatorsMutation($input: AddMediatorsInput!) {
    addMediators(input: $input) {
      mediators {
        edges {
          node {
            id
            user {
              username
            }
          }
        }
      }
    }
  }
`

const commit = (
  variables: AddMediatorsMutationVariables,
  connectionId: string,
): Promise<AddMediatorsMutationResponse> =>
  commitMutation<AddMediatorsMutation>(environment, {
    mutation,
    variables,
    updater: (store: any) => {
      const connection = store.get(connectionId)
      const mediators = store.getRootField('addMediators')?.getLinkedRecord('mediators')?.getLinkedRecords('edges')
      if (!mediators) return
      mediators.forEach(mediator => ConnectionHandler.insertEdgeAfter(connection, mediator))
    },
  })

export default { commit }
