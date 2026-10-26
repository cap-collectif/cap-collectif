import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { commitLocalUpdate, GraphQLTaggedNode } from 'relay-runtime'
import { applyOptimisticVoteAddition } from './proposalVoteOptimistic'
import type {
  AddProposalVoteMutation,
  AddProposalVoteMutation$data,
  AddProposalVoteMutation$variables,
} from '@relay/AddProposalVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalVoteMutation($input: AddProposalVoteInput!) {
    addProposalVote(input: $input) {
      errorCode
      vote {
        id
        completionStatus
      }
    }
  }
` as GraphQLTaggedNode

type Variables = AddProposalVoteMutation$variables & {
  stepId: string
}

const commit = (variables: Variables, isAuthenticated = true): Promise<AddProposalVoteMutation$data> => {
  const input = { ...variables.input, anonymously: !isAuthenticated }

  return commitMutation<AddProposalVoteMutation>(environment, {
    mutation,
    variables: {
      input,
    },
    optimisticUpdater: store => applyOptimisticVoteAddition(store, input),
    onCompleted: (data, errors) => {
      const vote = data?.addProposalVote?.vote
      if (
        errors ||
        data?.addProposalVote?.errorCode ||
        !vote ||
        vote.completionStatus !== 'COMPLETED'
      ) {
        return
      }
      commitLocalUpdate(environment, store => applyOptimisticVoteAddition(store, { ...input, voteId: vote.id }))
    },
  })
}

export default { commit }
