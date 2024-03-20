import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateOrUpdateConsultationMutation,
  CreateOrUpdateConsultationMutation$variables,
  CreateOrUpdateConsultationMutation$data,
} from '@relay/CreateOrUpdateConsultationMutation.graphql'

const mutation = graphql`
  mutation CreateOrUpdateConsultationMutation($input: CreateOrUpdateConsultationInput!) {
    createOrUpdateConsultation(input: $input) {
      consultations {
        id
        title
        description
        sections {
          title
          position
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateOrUpdateConsultationMutation$variables,
): Promise<CreateOrUpdateConsultationMutation$data> =>
  commitMutation<CreateOrUpdateConsultationMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
