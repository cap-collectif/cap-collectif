import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateProposalFusionMutation,
  CreateProposalFusionMutation$data,
  CreateProposalFusionMutation$variables,
} from '@relay/CreateProposalFusionMutation.graphql'

const mutation = graphql`
  mutation CreateProposalFusionMutation($input: CreateProposalFusionInput!) {
    createProposalFusion(input: $input) {
      proposal {
        id
        adminUrl
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: CreateProposalFusionMutation$variables): Promise<CreateProposalFusionMutation$data> =>
  commitMutation<CreateProposalFusionMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
