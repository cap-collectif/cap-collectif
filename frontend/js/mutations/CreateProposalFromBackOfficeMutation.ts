// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  CreateProposalFromBackOfficeMutationVariables,
  CreateProposalFromBackOfficeMutationResponse,
} from '~relay/CreateProposalFromBackOfficeMutation.graphql'

const mutation = graphql`
  mutation CreateProposalFromBackOfficeMutation($input: CreateProposalFromBackOfficeInput!) {
    createProposalFromBackOffice(input: $input) {
      proposal {
        id
        url
        publicationStatus
      }
      userErrors {
        message
      }
    }
  }
`

const commit = (
  variables: CreateProposalFromBackOfficeMutationVariables,
): Promise<CreateProposalFromBackOfficeMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
