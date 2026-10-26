import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import { applyOptimisticVoteRemoval } from './proposalVoteOptimistic'
import type {
  RemoveProposalVoteMutation,
  RemoveProposalVoteMutation$data,
  RemoveProposalVoteMutation$variables,
} from '@relay/RemoveProposalVoteMutation.graphql'

const mutation = graphql`
  mutation RemoveProposalVoteMutation($input: RemoveProposalVoteInput!) {
    removeProposalVote(input: $input) {
      __typename
    }
  }
` as GraphQLTaggedNode

type Variables = RemoveProposalVoteMutation$variables & {
  stepId: string
}

type OptimisticData = {
  proposalId: string
  stepId: string
  voteId: string | null
}

const commit = (
  variables: Variables,
  optimisticData?: OptimisticData,
  optimistic = true,
): Promise<RemoveProposalVoteMutation$data> =>
  commitMutation<RemoveProposalVoteMutation>(environment, {
    mutation,
    variables: { input: variables.input },
    optimisticUpdater: optimistic && optimisticData ? store => applyOptimisticVoteRemoval(store, optimisticData) : undefined,
    updater: optimisticData ? store => applyOptimisticVoteRemoval(store, optimisticData) : undefined,
  })

export default { commit }
