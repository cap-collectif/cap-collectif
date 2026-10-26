import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { commitLocalUpdate, GraphQLTaggedNode } from 'relay-runtime'
import { applyOptimisticVoteAddition } from './proposalVoteOptimistic'
import type {
  AddProposalSmsVoteMutation,
  AddProposalSmsVoteMutation$data,
  AddProposalSmsVoteMutation$variables,
} from '@relay/AddProposalSmsVoteMutation.graphql'

const mutation = graphql`
  mutation AddProposalSmsVoteMutation($input: AddProposalSmsVoteInput!) {
    addProposalSmsVote(input: $input) {
      errorCode
      participantToken
      vote {
        id
        completionStatus
      }
    }
  }
` as GraphQLTaggedNode

type Variables = AddProposalSmsVoteMutation$variables & { stepId: string }

const commit = (variables: Variables): Promise<AddProposalSmsVoteMutation$data> => {
  const input = { ...variables.input, anonymously: variables.input.anonymously ?? true }

  return commitMutation<AddProposalSmsVoteMutation>(environment, {
    mutation,
    variables: { input },
    optimisticUpdater: store => applyOptimisticVoteAddition(store, input),
    onCompleted: (data, errors) => {
      const vote = data?.addProposalSmsVote?.vote
      if (
        errors ||
        data?.addProposalSmsVote?.errorCode ||
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
