import { ConnectionHandler, graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import type {
  UpdateMediatorVotesMutation,
  UpdateMediatorVotesMutationResponse,
  UpdateMediatorVotesMutationVariables,
} from '@relay/UpdateMediatorVotesMutation.graphql'

const mutation = graphql`
  mutation UpdateMediatorVotesMutation($input: UpdateMediatorVotesInput!, $mediatorId: ID!) {
    updateMediatorVotes(input: $input) {
      participant {
        token
        id
        createdAt
        firstname
        lastname
        email
        votes(mediatorId: $mediatorId) {
          edges {
            node {
              id
              isAccounted
              ...on ProposalVote {
                  proposal {
                      id
                      title
                      media {
                          url
                      }
                  }
              }
            }
          }
        }
      }
    }
  }
`

const commit = (variables: UpdateMediatorVotesMutationVariables): Promise<UpdateMediatorVotesMutationResponse> =>
  commitMutation<UpdateMediatorVotesMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
