import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddProposalVoteMutation,
  AddProposalVoteMutation$data,
  AddProposalVoteMutation$variables,
} from '@relay/AddProposalVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalVoteMutation($input: AddProposalVoteInput!, $stepId: ID!) {
    addProposalVote(input: $input) {
      errorCode
      vote {
        id
        step {
          id
          votesMin
          votesLimit
          budget
          open
          viewerVotes {
            totalCount
            creditsLeft
            edges {
              node {
                id
                ranking
                proposal {
                  id
                  title
                }
              }
            }
          }
          requirements {
            viewerMeetsTheRequirements
          }
          proposals {
            edges {
              node {
                id
                estimation
                viewerHasVote(step: $stepId)
                viewerVote(step: $stepId) {
                  id
                  completionStatus
                }
                votes {
                  totalCount
                }
              }
            }
          }
        }
        completionStatus
      }
    }
  }
` as GraphQLTaggedNode

type Variables = AddProposalVoteMutation$variables & {
  stepId: string
}

const commit = (variables: Variables, isAuthenticated = true): Promise<AddProposalVoteMutation$data> =>
  commitMutation<AddProposalVoteMutation>(environment, {
    mutation,
    variables: {
      ...variables,
      input: {
        ...variables.input,
        anonymously: !isAuthenticated,
      },
    },
  })

export default { commit }
