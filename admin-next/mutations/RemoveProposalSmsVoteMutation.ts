import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import { applyOptimisticVoteRemoval } from './proposalVoteOptimistic'
import type {
  RemoveProposalSmsVoteMutation,
  RemoveProposalSmsVoteMutation$data,
  RemoveProposalSmsVoteMutation$variables,
} from '@relay/RemoveProposalSmsVoteMutation.graphql'

const mutation = graphql`
  mutation RemoveProposalSmsVoteMutation($input: RemoveProposalSmsVoteInput!) {
    removeProposalSmsVote(input: $input) {
      errorCode
      previousVoteId
    }
  }
` as GraphQLTaggedNode

type Variables = RemoveProposalSmsVoteMutation$variables & { stepId: string }

const commit = (variables: Variables, optimistic = true): Promise<RemoveProposalSmsVoteMutation$data> =>
  commitMutation<RemoveProposalSmsVoteMutation>(environment, {
    mutation,
    variables: { input: variables.input },
    optimisticUpdater: optimistic
      ? store =>
          applyOptimisticVoteRemoval(store, {
            proposalId: variables.input.proposalId,
            stepId: variables.input.stepId,
            voteId: null,
          })
      : undefined,
    updater: (store, data) => {
      if (data?.removeProposalSmsVote?.errorCode) return
      applyOptimisticVoteRemoval(store, {
          proposalId: variables.input.proposalId,
          stepId: variables.input.stepId,
          voteId: null,
      })
    },
  })

export default { commit }
