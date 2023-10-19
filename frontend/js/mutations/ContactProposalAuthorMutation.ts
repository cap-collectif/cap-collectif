// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  ContactProposalAuthorMutationVariables,
  ContactProposalAuthorMutationResponse,
} from '~relay/ContactProposalAuthorMutation.graphql'

const mutation = graphql`
  mutation ContactProposalAuthorMutation($input: ContactProposalAuthorInput!) {
    contactProposalAuthor(input: $input) {
      error
    }
  }
`

const commit = (variables: ContactProposalAuthorMutationVariables): Promise<ContactProposalAuthorMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      contactProposalAuthor: {
        error: null,
      },
    },
  })

export default {
  commit,
}
