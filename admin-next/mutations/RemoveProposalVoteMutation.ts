import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  RemoveProposalVoteMutation,
  RemoveProposalVoteMutation$data,
  RemoveProposalVoteMutation$variables,
} from '@relay/RemoveProposalVoteMutation.graphql'

const mutation = graphql`
  mutation RemoveProposalVoteMutation($input: RemoveProposalVoteInput!, $stepId: ID!) {
    removeProposalVote(input: $input) {
      previousVoteId
      areRemainingVotesAccounted
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
    }
  }
` as GraphQLTaggedNode

type Variables = RemoveProposalVoteMutation$variables & {
  stepId: string
}

const commit = (variables: Variables): Promise<RemoveProposalVoteMutation$data> =>
  commitMutation<RemoveProposalVoteMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
