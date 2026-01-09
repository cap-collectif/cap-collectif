import type {
  CreateProposalMutation$data,
  CreateProposalMutation$variables,
  CreateProposalMutation as CreateProposalMutationType,
} from '@relay/CreateProposalMutation.graphql'
import { graphql, GraphQLTaggedNode } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'

const mutation = graphql`
  mutation CreateProposalMutation($input: CreateProposalInput!) {
    createProposal(input: $input) {
      proposal {
        id
        title
        url
        slug
        reference
        publicationStatus
      }
      userErrors {
        message
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateProposalMutation$variables): Promise<CreateProposalMutation$data> =>
  commitMutation<CreateProposalMutationType>(environment, {
    mutation,
    variables,
  })

export default { commit }
