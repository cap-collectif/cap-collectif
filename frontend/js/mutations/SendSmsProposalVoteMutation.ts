// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  SendSmsProposalVoteMutationVariables,
  SendSmsProposalVoteMutationResponse,
} from '~relay/SendSmsProposalVoteMutation.graphql'

const mutation = graphql`
  mutation SendSmsProposalVoteMutation($input: SendSmsProposalVoteInput!) {
    sendSmsProposalVote(input: $input) {
      errorCode
    }
  }
`

const commit = (variables: SendSmsProposalVoteMutationVariables): Promise<SendSmsProposalVoteMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
