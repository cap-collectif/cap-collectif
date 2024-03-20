import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateMediatorVotesMutation,
  UpdateMediatorVotesMutation$data,
  UpdateMediatorVotesMutation$variables,
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
              ... on ProposalVote {
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
` as GraphQLTaggedNode

const commit = (variables: UpdateMediatorVotesMutation$variables): Promise<UpdateMediatorVotesMutation$data> =>
  commitMutation<UpdateMediatorVotesMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
